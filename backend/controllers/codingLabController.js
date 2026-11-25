/**
 * SANKALP AI - Autonomous University Examination Preparation Platform
 * Coding Practice Lab Controller
 */

const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const CodingSavedCode = require('../models/CodingSavedCode');
const CodingProgress = require('../models/CodingProgress');
const { executeCode, executeAgainstTestCases, LANGUAGE_CONFIG } = require('../services/judge0Service');
const codingAiService = require('../services/codingAiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Helper to update or initialize student coding streak & statistics
 */
async function updateStudentProgress(studentId, problem, isAccepted, language) {
  if (!studentId) return null;

  try {
    let progress = await CodingProgress.findOne({ student_id: studentId });
    if (!progress) {
      progress = new CodingProgress({
        student_id: studentId,
        solved_problem_ids: [],
        attempted_problem_ids: [],
        topic_stats: new Map(),
      });
    }

    // 1. Total submissions
    progress.total_submissions += 1;
    if (isAccepted) {
      progress.accepted_submissions += 1;
    }

    // 2. Language statistics
    const langKey = (language || '').toLowerCase();
    if (progress.language_stats && progress.language_stats[langKey] !== undefined) {
      progress.language_stats[langKey] += 1;
    }

    // 3. Problem attempted tracking
    if (problem && problem._id) {
      const probIdStr = problem._id.toString();
      const alreadyAttempted = progress.attempted_problem_ids.some(id => id.toString() === probIdStr);
      if (!alreadyAttempted) {
        progress.attempted_problem_ids.push(problem._id);
        progress.total_attempted = progress.attempted_problem_ids.length;
      }

      // Topic stats
      const topicName = problem.topic || 'General';
      let tStats = progress.topic_stats.get(topicName) || { attempted: 0, solved: 0 };
      if (!alreadyAttempted) {
        tStats.attempted += 1;
      }

      // If accepted, track solved
      if (isAccepted) {
        const alreadySolved = progress.solved_problem_ids.some(id => id.toString() === probIdStr);
        if (!alreadySolved) {
          progress.solved_problem_ids.push(problem._id);
          progress.total_solved = progress.solved_problem_ids.length;

          if (problem.difficulty === 'Easy') progress.easy_solved += 1;
          else if (problem.difficulty === 'Medium') progress.medium_solved += 1;
          else if (problem.difficulty === 'Hard') progress.hard_solved += 1;

          tStats.solved += 1;
        }
      }

      progress.topic_stats.set(topicName, tStats);
    }

    // 4. Streak Calculation
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Activity history update
    const existingActivity = progress.activity_history.find(a => a.date === todayStr);
    if (existingActivity) {
      existingActivity.count += 1;
    } else {
      progress.activity_history.push({ date: todayStr, count: 1 });
      // Keep last 120 days of activity
      if (progress.activity_history.length > 120) {
        progress.activity_history = progress.activity_history.slice(-120);
      }
    }

    // Streak logic
    if (progress.last_active_date) {
      const lastDate = new Date(progress.last_active_date);
      const lastDateStr = lastDate.toISOString().split('T')[0];

      if (lastDateStr !== todayStr) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDateStr === yesterdayStr) {
          // Continuous consecutive day
          progress.current_streak += 1;
        } else {
          // Missed a day, reset streak to 1
          progress.current_streak = 1;
        }
      }
    } else {
      // First active day
      progress.current_streak = 1;
    }

    if (progress.current_streak > progress.longest_streak) {
      progress.longest_streak = progress.current_streak;
    }
    progress.last_active_date = now;

    await progress.save();
    return progress;
  } catch (err) {
    console.error('[Coding Progress Update Error]:', err.message);
    return null;
  }
}

/**
 * 1. Execute Code (Run Code button in Playground or Problem test runner)
 */
const runCode = async (req, res, next) => {
  try {
    const source_code = req.body.source_code || req.body.code;
    const language = req.body.language;
    const stdin = req.body.stdin || '';
    const time_limit = req.body.time_limit;
    const memory_limit = req.body.memory_limit;
    const problem_id = req.body.problem_id || req.body.problemId;
    const student_id = req.body.student_id || req.body.studentId;

    if (!source_code || !source_code.trim()) {
      return errorResponse(res, 'Source code cannot be empty.', 400);
    }
    if (!language) {
      return errorResponse(res, 'Language is required.', 400);
    }

    const execResult = await executeCode({
      source_code,
      language,
      stdin,
      time_limit,
      memory_limit,
    });

    // Record non-submission run
    if (student_id) {
      const submission = new CodingSubmission({
        student_id,
        problem_id: problem_id || null,
        language: execResult.language,
        language_id: execResult.language_id,
        source_code,
        stdin,
        status: execResult.status === 'Accepted' ? 'Executed' : execResult.status,
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        compile_output: execResult.compile_output,
        execution_time: execResult.time,
        memory_usage: execResult.memory,
        is_submission: false,
      });
      await submission.save().catch(e => console.warn('[Run Submission Save Error]:', e.message));
    }

    return successResponse(res, {
      ...execResult,
      compileOutput: execResult.compile_output,
      executionTime: execResult.time ? `${execResult.time}s` : null,
      memoryUsage: execResult.memory ? `${Math.round(execResult.memory / 1024)}MB` : null,
      status: execResult.status,
    }, 'Code executed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Submit Solution (Submit button against Hidden Test Cases)
 */
const submitSolution = async (req, res, next) => {
  try {
    const problem_id = req.body.problem_id || req.body.problemId;
    const language = req.body.language;
    const source_code = req.body.source_code || req.body.code;
    const student_id = req.body.student_id || req.body.studentId;

    if (!problem_id) {
      return errorResponse(res, 'Problem ID is required for submission.', 400);
    }
    if (!source_code || !source_code.trim()) {
      return errorResponse(res, 'Source code cannot be empty.', 400);
    }
    if (!language) {
      return errorResponse(res, 'Programming language is required.', 400);
    }
    if (!student_id) {
      return errorResponse(res, 'Student session ID is required.', 400);
    }

    const problem = await CodingProblem.findById(problem_id);
    if (!problem || !problem.is_active) {
      return errorResponse(res, 'Problem not found or inactive.', 404);
    }

    // Execute against both Sample & Hidden test cases
    const batchResult = await executeAgainstTestCases({
      source_code,
      language,
      sample_test_cases: problem.sample_test_cases || [],
      hidden_test_cases: problem.hidden_test_cases || [],
      time_limit: problem.time_limit || 2.0,
      memory_limit: problem.memory_limit || 128000,
    });

    const isAccepted = batchResult.status === 'Accepted';

    // 1. Update Problem stats
    problem.total_submissions += 1;
    if (isAccepted) {
      problem.accepted_submissions += 1;
    }
    await problem.save();

    // 2. Record official submission in DB
    const langKey = language.toLowerCase();
    const config = LANGUAGE_CONFIG[langKey];
    const submission = new CodingSubmission({
      student_id,
      problem_id: problem._id,
      language: langKey,
      language_id: config?.id || 103,
      source_code,
      status: batchResult.status,
      stdout: batchResult.results.map(r => r.actual_output).join('\n'),
      compile_output: batchResult.compile_output,
      execution_time: batchResult.max_time,
      memory_usage: batchResult.max_memory,
      test_cases_passed: batchResult.test_cases_passed,
      total_test_cases: batchResult.total_test_cases,
      test_case_results: batchResult.results,
      is_submission: true,
    });
    await submission.save();

    // 3. Update student streak and mastery progress
    const updatedProgress = await updateStudentProgress(student_id, problem, isAccepted, langKey);

    return successResponse(res, {
      submission: {
        _id: submission._id,
        status: batchResult.status,
        passedTests: batchResult.test_cases_passed,
        totalTests: batchResult.total_test_cases,
        test_cases_passed: batchResult.test_cases_passed,
        total_test_cases: batchResult.total_test_cases,
        results: batchResult.results,
        time: batchResult.max_time ? `${batchResult.max_time}s` : null,
        memory: batchResult.max_memory ? `${Math.round(batchResult.max_memory / 1024)}MB` : null,
        executionTime: batchResult.max_time ? `${batchResult.max_time}s` : null,
        memoryUsed: batchResult.max_memory ? `${Math.round(batchResult.max_memory / 1024)}MB` : null,
        compileOutput: batchResult.compile_output,
        code: source_code,
        language: langKey,
      },
      submission_id: submission._id,
      status: batchResult.status,
      test_cases_passed: batchResult.test_cases_passed,
      total_test_cases: batchResult.total_test_cases,
      results: batchResult.results,
      execution_time: batchResult.max_time,
      memory_usage: batchResult.max_memory,
      compile_output: batchResult.compile_output,
      progress: updatedProgress,
    }, isAccepted ? 'All test cases passed! Solution accepted.' : `Submission completed with status: ${batchResult.status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Get Problems List (with filters & completion badges)
 */
const getProblems = async (req, res, next) => {
  try {
    const { difficulty, topic, search, student_id } = req.query;

    const query = { is_active: true };

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }
    if (topic && topic !== 'All') {
      query.topic = topic;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Exclude hidden test cases from public listing
    const problems = await CodingProblem.find(query)
      .select('-hidden_test_cases')
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Attach student solved/attempted status if student_id provided
    let solvedSet = new Set();
    let attemptedSet = new Set();

    if (student_id) {
      const progress = await CodingProgress.findOne({ student_id }).lean();
      if (progress) {
        if (progress.solved_problem_ids) {
          progress.solved_problem_ids.forEach(id => solvedSet.add(id.toString()));
        }
        if (progress.attempted_problem_ids) {
          progress.attempted_problem_ids.forEach(id => attemptedSet.add(id.toString()));
        }
      }
    }

    const annotatedProblems = problems.map(p => {
      const pId = p._id.toString();
      const status = solvedSet.has(pId) ? 'solved' : (attemptedSet.has(pId) ? 'attempted' : 'unsolved');
      const acceptance_rate = p.total_submissions > 0
        ? Math.round((p.accepted_submissions / p.total_submissions) * 100)
        : 0;
      return {
        ...p,
        starterTemplates: p.starter_templates || {},
        sampleTestCases: (p.sample_test_cases || []).map(tc => ({
          input: tc.input,
          output: tc.output,
          expectedOutput: tc.output,
          explanation: tc.explanation,
        })),
        inputFormat: p.input_format,
        outputFormat: p.output_format,
        status,
        acceptance_rate,
      };
    });

    return successResponse(res, { problems: annotatedProblems }, 'Problems retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Problem by Slug
 */
const getProblemBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { student_id, language = 'c' } = req.query;

    const problem = await CodingProblem.findOne({ slug: slug.toLowerCase(), is_active: true })
      .select('-hidden_test_cases')
      .lean();

    if (!problem) {
      return errorResponse(res, 'Problem not found.', 404);
    }

    // Load student's saved code if exists
    let savedCode = null;
    let studentStatus = 'unsolved';

    if (student_id) {
      const savedDoc = await CodingSavedCode.findOne({
        student_id,
        problem_id: problem._id,
        language: language.toLowerCase(),
      }).lean();

      if (savedDoc) {
        savedCode = savedDoc.code;
      }

      const progress = await CodingProgress.findOne({ student_id }).lean();
      if (progress) {
        const pId = problem._id.toString();
        if (progress.solved_problem_ids?.some(id => id.toString() === pId)) {
          studentStatus = 'solved';
        } else if (progress.attempted_problem_ids?.some(id => id.toString() === pId)) {
          studentStatus = 'attempted';
        }
      }
    }

    const acceptance_rate = problem.total_submissions > 0
      ? Math.round((problem.accepted_submissions / problem.total_submissions) * 100)
      : 0;

    const normalizedProblem = {
      ...problem,
      sampleTestCases: (problem.sample_test_cases || []).map(tc => ({
        input: tc.input,
        output: tc.output,
        expectedOutput: tc.output,
        explanation: tc.explanation,
      })),
      starterTemplates: problem.starter_templates || {},
      inputFormat: problem.input_format,
      outputFormat: problem.output_format,
      acceptance_rate,
      student_status: studentStatus,
      saved_code: savedCode,
    };

    return successResponse(res, {
      problem: normalizedProblem,
      ...normalizedProblem,
    }, 'Problem details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Save Draft Code
 */
const saveCode = async (req, res, next) => {
  try {
    const student_id = req.body.student_id || req.body.studentId;
    const problem_id = req.body.problem_id || req.body.problemId;
    const language = req.body.language;
    const code = req.body.code !== undefined ? req.body.code : req.body.source_code;
    const custom_input = req.body.custom_input || req.body.customInput || '';

    if (!student_id) {
      return errorResponse(res, 'Student ID is required.', 400);
    }
    if (!language) {
      return errorResponse(res, 'Language is required.', 400);
    }
    if (code === undefined || code === null) {
      return errorResponse(res, 'Code cannot be null.', 400);
    }

    const filter = {
      student_id,
      problem_id: problem_id || null,
      language: language.toLowerCase(),
    };

    const update = {
      code,
      custom_input,
    };

    const saved = await CodingSavedCode.findOneAndUpdate(
      filter,
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(res, { saved_code: saved, savedCode: saved }, 'Code saved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Get Saved Code
 */
const getSavedCode = async (req, res, next) => {
  try {
    const student_id = req.query.student_id || req.query.studentId;
    const problem_id = req.query.problem_id || req.query.problemId;
    const language = req.query.language;

    if (!student_id || !language) {
      return errorResponse(res, 'Student ID and Language are required.', 400);
    }

    const saved = await CodingSavedCode.findOne({
      student_id,
      problem_id: problem_id || null,
      language: language.toLowerCase(),
    }).lean();

    return successResponse(res, { saved_code: saved || null, savedCode: saved || null }, 'Saved code retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Get Student Progress & Statistics
 */
const getStudentProgress = async (req, res, next) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return errorResponse(res, 'Student ID is required.', 400);
    }

    let progress = await CodingProgress.findOne({ student_id })
      .populate('solved_problem_ids', 'title slug difficulty topic')
      .lean();

    if (!progress) {
      progress = {
        student_id,
        total_attempted: 0,
        total_solved: 0,
        easy_solved: 0,
        medium_solved: 0,
        hard_solved: 0,
        total_submissions: 0,
        accepted_submissions: 0,
        solved_problem_ids: [],
        attempted_problem_ids: [],
        language_stats: { c: 0, cpp: 0, python: 0, java: 0, javascript: 0, typescript: 0 },
        topic_stats: {},
        current_streak: 0,
        longest_streak: 0,
        activity_history: [],
      };
    }

    // Fetch total problems count for percentage calculation
    const totalCount = await CodingProblem.countDocuments({ is_active: true });
    const easyCount = await CodingProblem.countDocuments({ is_active: true, difficulty: 'Easy' });
    const mediumCount = await CodingProblem.countDocuments({ is_active: true, difficulty: 'Medium' });
    const hardCount = await CodingProblem.countDocuments({ is_active: true, difficulty: 'Hard' });

    // Recent 10 submissions
    const recentSubmissions = await CodingSubmission.find({ student_id, is_submission: true })
      .populate('problem_id', 'title slug difficulty topic')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const acceptance_rate = progress.total_submissions > 0
      ? Math.round((progress.accepted_submissions / progress.total_submissions) * 100)
      : 0;

    const progressObj = {
      ...progress,
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      totalSolved: progress.total_solved,
      totalAttempted: progress.total_attempted,
      problemsSolved: progress.solved_problem_ids || [],
      problemsAttempted: progress.attempted_problem_ids || [],
      difficultyStats: {
        easy: progress.easy_solved || 0,
        medium: progress.medium_solved || 0,
        hard: progress.hard_solved || 0,
      },
      languageStats: progress.language_stats || {},
      topicStats: progress.topic_stats || {},
      acceptanceRate: acceptance_rate,
      acceptance_rate,
      platform_totals: {
        total: totalCount,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
      recent_submissions: recentSubmissions,
    };

    return successResponse(res, {
      progress: progressObj,
      ...progressObj,
    }, 'Student coding progress retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Get Submissions History
 */
const getSubmissions = async (req, res, next) => {
  try {
    const { student_id, problem_id, limit = 20 } = req.query;

    const query = {};
    if (student_id) query.student_id = student_id;
    if (problem_id) query.problem_id = problem_id;

    const submissions = await CodingSubmission.find(query)
      .populate('problem_id', 'title slug difficulty topic')
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 20, 50))
      .lean();

    return successResponse(res, submissions, 'Submissions retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * 9. AI Assistance (Explain, Debug, Complexity, Hints, Solution)
 */
const requestAiAssist = async (req, res, next) => {
  try {
    const action = req.body.action;
    const apiKey = req.body.apiKey || req.body.groqApiKey || process.env.GROQ_API_KEY;
    const model = req.body.model || req.body.groqModel;
    const code = req.body.code;
    const language = req.body.language || 'python';
    const problem_id = req.body.problem_id || req.body.problemId;
    const problemSlug = req.body.problemSlug || req.body.problem_slug;
    const problem_title = req.body.problem_title || req.body.problemTitle;
    const errorOutput = req.body.errorOutput;
    const stdin = req.body.stdin;
    const stdout = req.body.stdout;
    const hintLevel = req.body.hintLevel || 1;

    if (!apiKey) {
      return errorResponse(res, 'Free Groq API Key is required for AI coding assistance. Please enter your key or configure in Settings.', 401);
    }
    if (!action) {
      return errorResponse(res, 'Action is required (explain, debug, complexity, hint, solution).', 400);
    }

    let problem = null;
    if (problem_id) {
      problem = await CodingProblem.findById(problem_id).lean();
    } else if (problemSlug) {
      problem = await CodingProblem.findOne({ slug: problemSlug.toLowerCase() }).lean();
    }

    let aiResult = '';

    switch (action) {
      case 'explain':
        aiResult = await codingAiService.explainCode({
          apiKey,
          model,
          code,
          language,
          problemTitle: problem?.title || problem_title,
        });
        break;

      case 'debug':
        aiResult = await codingAiService.debugCode({
          apiKey,
          model,
          code,
          language,
          problemTitle: problem?.title || problem_title,
          errorOutput,
          stdin,
          stdout,
        });
        break;

      case 'complexity':
        aiResult = await codingAiService.analyzeComplexity({
          apiKey,
          model,
          code,
          language,
          problemTitle: problem?.title || problem_title,
        });
        break;

      case 'hint':
        if (!problem) {
          problem = {
            title: problem_title || `${language.toUpperCase()} Algorithm / Playground`,
            description: 'Provide progressive guided hints for the current code implementation without giving away full answer.',
            constraints: 'Standard',
          };
        }
        aiResult = await codingAiService.getHint({
          apiKey,
          model,
          code,
          language,
          problem,
          hintLevel,
        });
        break;

      case 'solution':
        if (!problem) {
          problem = {
            title: problem_title || `${language.toUpperCase()} Algorithm Optimization`,
            description: 'Explain the optimal algorithmic approach and pattern for solving this task.',
            input_format: 'Standard',
            output_format: 'Standard',
            difficulty: 'General',
            topic: 'DSA & Algorithms',
            constraints: 'Standard',
          };
        }
        aiResult = await codingAiService.explainSolution({
          apiKey,
          model,
          problem,
          language,
          code,
        });
        break;

      case 'ask':
      case 'custom':
        aiResult = await codingAiService.askQuestion({
          apiKey,
          model,
          code,
          language,
          problemTitle: problem?.title || problem_title,
          question: req.body.question || req.body.prompt,
          errorOutput,
          stdout,
        });
        break;

      default:
        return errorResponse(res, `Unknown AI action: "${action}"`, 400);
    }

    const responseText = (typeof aiResult === 'object' && aiResult !== null && aiResult.content)
      ? aiResult.content
      : (typeof aiResult === 'string' ? aiResult : String(aiResult || ''));

    return successResponse(res, {
      action,
      response: responseText,
      model: aiResult?.model,
      usage: aiResult?.usage,
    }, 'AI response generated');
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Get Language Configs & Starter Templates
 */
const getLanguageConfigs = (req, res) => {
  return successResponse(res, LANGUAGE_CONFIG, 'Language configurations retrieved');
};

module.exports = {
  runCode,
  submitSolution,
  getProblems,
  getProblemBySlug,
  saveCode,
  getSavedCode,
  getStudentProgress,
  getSubmissions,
  requestAiAssist,
  getLanguageConfigs,
};
