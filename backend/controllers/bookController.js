const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const Subject = require('../models/Subject');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const { extractPdfText, extractBookMetadata } = require('../services/pdfService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');
const { uploadToGridFS, streamFromGridFS, resolveLocalFilePath } = require('../services/storageService');
const { isCloudinaryConfigured, uploadPdfToCloudinary } = require('../config/cloudinary');

// GET /api/admin/books or /api/public/books
const getBooks = async (req, res, next) => {
  try {
    const { course_id, semester_id, subject_id, is_active } = req.query;
    const filter = {};

    if (course_id) filter.course_id = course_id;
    if (semester_id) filter.semester_id = semester_id;
    if (subject_id) filter.subject_id = subject_id;
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    const books = await Book.find(filter)
      .populate('course_id', 'name code')
      .populate('semester_id', 'name number')
      .populate('subject_id', 'name code')
      .sort({ createdAt: -1 });

    return successResponse(res, books, 'Books retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/books/:id or /api/public/books/:id
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('course_id', 'name code')
      .populate('semester_id', 'name number')
      .populate('subject_id', 'name code');

    if (!book) return errorResponse(res, 'Book not found', 404);
    return successResponse(res, book, 'Book details');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/books/upload
const uploadBook = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a PDF textbook file', 400);
    }

    const {
      title,
      author,
      edition,
      description,
      course_id,
      semester_id,
      subject_id,
    } = req.body;

    if (!subject_id) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Subject ID is required to link the textbook', 400);
    }

    // Verify Subject and resolve Semester and Course
    const subject = await Subject.findById(subject_id).populate('semester_id');
    if (!subject) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Target subject not found', 404);
    }

    const resolvedSemesterId = semester_id || subject.semester_id?._id;
    const semester = await Semester.findById(resolvedSemesterId);
    const resolvedCourseId = course_id || semester?.course_id;

    if (!resolvedCourseId || !resolvedSemesterId) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Course or Semester could not be resolved from Subject', 400);
    }

    // Auto-detect metadata from PDF
    const autoMeta = await extractBookMetadata(req.file.path, req.file.originalname);

    // Attempt PDF Text & Page count extraction
    let extractedText = '';
    let totalPages = autoMeta.totalPages || 0;
    try {
      const parsed = await extractPdfText(req.file.path);
      extractedText = parsed.text || '';
      totalPages = parsed.numPages || totalPages;
    } catch (parseErr) {
      console.warn('[Book Upload] Text extraction warning:', parseErr.message);
    }

    // Generate concise summary index (first 8000 characters of clean text)
    const cleanSnippet = extractedText
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);

    const bookTitle = title?.trim() || autoMeta.title;
    const bookAuthor = author?.trim() || autoMeta.author;
    const bookEdition = edition?.trim() || autoMeta.edition;
    const bookDescription = description?.trim() || autoMeta.description;

    let gridfsId = null;
    try {
      const gfs = await uploadToGridFS(req.file.path, req.file.originalname);
      gridfsId = gfs.gridfs_id;
    } catch (gfsErr) {
      console.warn('[GridFS Book Upload Warning]:', gfsErr.message);
    }

    let cloudinaryUrl = '';
    let cloudinaryPublicId = '';
    if (isCloudinaryConfigured()) {
      try {
        const cRes = await uploadPdfToCloudinary(req.file.path, 'sankalp_ai/books', req.file.originalname);
        cloudinaryUrl = cRes.secure_url;
        cloudinaryPublicId = cRes.public_id;
      } catch (cErr) {
        console.warn('[Cloudinary Book Upload Warning]:', cErr.message);
      }
    }

    const book = await Book.create({
      title: bookTitle,
      author: bookAuthor,
      edition: bookEdition,
      description: bookDescription,
      course_id: resolvedCourseId,
      semester_id: resolvedSemesterId,
      subject_id: subject._id,
      storage_path: req.file.path,
      gridfs_id: gridfsId,
      cloudinary_url: cloudinaryUrl,
      cloudinary_public_id: cloudinaryPublicId,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype || 'application/pdf',
      public_url: `/uploads/books/${req.file.filename}`,
      total_pages: totalPages,
      extracted_text: extractedText,
      summary_index: cleanSnippet,
      is_active: true,
    });

    await logAudit({
      action: 'UPLOAD_BOOK',
      entityType: 'Book',
      entityId: book._id,
      details: {
        title: book.title,
        subject: subject.name,
        pages: totalPages,
        size: book.file_size,
      },
      req,
    });

    const populatedBook = await Book.findById(book._id)
      .populate('course_id', 'name code')
      .populate('semester_id', 'name number')
      .populate('subject_id', 'name code');

    return successResponse(res, populatedBook, 'Textbook uploaded and indexed successfully!', 201);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

// PUT /api/admin/books/:id
const updateBook = async (req, res, next) => {
  try {
    const { title, author, edition, description, is_active } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return errorResponse(res, 'Book not found', 404);

    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (edition !== undefined) book.edition = edition.trim();
    if (description !== undefined) book.description = description.trim();
    if (is_active !== undefined) book.is_active = is_active;

    await book.save();

    await logAudit({
      action: 'UPDATE_BOOK',
      entityType: 'Book',
      entityId: book._id,
      details: { title: book.title },
      req,
    });

    return successResponse(res, book, 'Textbook details updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return errorResponse(res, 'Book not found', 404);

    // Remove file from disk
    if (book.storage_path && fs.existsSync(book.storage_path)) {
      try {
        fs.unlinkSync(book.storage_path);
      } catch (err) {
        console.warn('[Book Delete] Failed to remove file from disk:', err.message);
      }
    }

    await Book.findByIdAndDelete(req.params.id);

    await logAudit({
      action: 'DELETE_BOOK',
      entityType: 'Book',
      entityId: req.params.id,
      details: { title: book.title },
      req,
    });

    return successResponse(res, null, 'Textbook deleted successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/books/:id/process
const processBookText = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return errorResponse(res, 'Book not found', 404);

    if (!book.storage_path || !fs.existsSync(book.storage_path)) {
      return errorResponse(res, 'Textbook PDF file not found on disk', 404);
    }

    const parsed = await extractPdfText(book.storage_path);
    book.extracted_text = parsed.text || '';
    book.total_pages = parsed.numPages || 0;
    book.summary_index = (parsed.text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);

    await book.save();

    return successResponse(res, {
      id: book._id,
      totalPages: book.total_pages,
      extractedLength: book.extracted_text.length,
    }, 'Textbook text re-extracted and indexed successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/books/:id/view or /api/admin/books/:id/view
const viewBookPdf = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return errorResponse(res, 'Book not found', 404);

    // 1. Direct Cloudinary redirect if available (fastest, CDN powered)
    if (book.cloudinary_url && book.cloudinary_url.startsWith('http')) {
      return res.redirect(book.cloudinary_url);
    }

    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.file_name)}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // 2. Stream from GridFS if available
    if (book.gridfs_id) {
      try {
        const stream = streamFromGridFS(book.gridfs_id);
        stream.on('error', (err) => {
          console.warn('[GridFS Book Stream error]:', err.message);
          if (!res.headersSent) {
            const diskP = resolveLocalFilePath(book.storage_path, 'books');
            if (diskP && fs.existsSync(diskP)) {
              return fs.createReadStream(diskP).pipe(res);
            }
            return errorResponse(res, 'Book PDF not available on storage server', 404);
          }
        });
        return stream.pipe(res);
      } catch (e) {
        console.warn('GridFS stream error, falling back to disk:', e.message);
      }
    }

    // 3. Local disk fallback
    const resolvedPath = resolveLocalFilePath(book.storage_path, 'books');
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      return fs.createReadStream(resolvedPath).pipe(res);
    }

    return errorResponse(res, 'Book PDF not found on disk or storage server', 404);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/books/:id/download or /api/admin/books/:id/download
const downloadBookPdf = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return errorResponse(res, 'Book not found', 404);

    // 1. Direct Cloudinary redirect if available
    if (book.cloudinary_url && book.cloudinary_url.startsWith('http')) {
      return res.redirect(book.cloudinary_url);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(book.file_name)}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // 2. Stream from GridFS if available
    if (book.gridfs_id) {
      try {
        const stream = streamFromGridFS(book.gridfs_id);
        return stream.pipe(res);
      } catch (e) {
        console.warn('GridFS download failed, trying disk:', e.message);
      }
    }

    // 3. Local disk fallback
    const resolvedPath = resolveLocalFilePath(book.storage_path, 'books');
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      return res.download(resolvedPath, book.file_name);
    }

    return errorResponse(res, 'Book PDF not found on disk or storage server', 404);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/books/inspect
const inspectBookPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please provide a PDF file to inspect', 400);
    }

    const metadata = await extractBookMetadata(req.file.path, req.file.originalname);

    // Delete temp file after extraction
    if (fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }

    return successResponse(res, metadata, 'Metadata auto-extracted from PDF successfully');
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  uploadBook,
  inspectBookPdf,
  updateBook,
  deleteBook,
  processBookText,
  viewBookPdf,
  downloadBookPdf,
};
