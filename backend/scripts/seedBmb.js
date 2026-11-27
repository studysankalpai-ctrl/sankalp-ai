const mongoose = require('mongoose');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const ExaminationPaper = require('../models/ExaminationPaper');
const ImportantTopic = require('../models/ImportantTopic');

async function seedBmb() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/sankalp_ai');
    console.log('[Seed BMB] Connected to local MongoDB');

    let course = await Course.findOne({ code: 'BMB' });
    if (!course) {
      course = await Course.create({
        name: 'Master of Business Administration',
        code: 'BMB',
        description: 'Postgraduate 2-Year Professional Management Degree Program',
        is_published: true,
        is_archived: false,
        sort_order: 1,
      });
      console.log('[Seed BMB] Created Course:', course.name);
    } else {
      course.is_published = true;
      await course.save();
      console.log('[Seed BMB] Course BMB already exists');
    }

    let semester = await Semester.findOne({ course_id: course._id, number: 1 });
    if (!semester) {
      semester = await Semester.create({
        course_id: course._id,
        number: 1,
        name: 'Semester 1',
        is_published: true,
        is_archived: false,
        sort_order: 1,
      });
      console.log('[Seed BMB] Created Semester 1');
    } else {
      semester.is_published = true;
      await semester.save();
    }

    const bmbSubjects = [
      {
        code: 'BMB101',
        name: 'Management Concepts & Organisational Behaviour',
        description: 'Core foundations of organizational structure, leadership dynamics, motivation theories, and managerial decision systems.',
        units: [
          { number: 1, name: 'Evolution of Management Thought', description: 'Classical, Neo-classical and Modern management schools, Scientific management by Taylor, Administrative theory by Fayol, Hawthorne experiments.', topics: ['Taylor Scientific Management', 'Henri Fayol 14 Principles', 'Hawthorne Studies & Human Relations', 'Bureaucratic Model of Max Weber', 'Contingency & Systems Approach'] },
          { number: 2, name: 'Planning and Decision Making', description: 'Strategic planning, SWOT matrix, bounded rationality in decisions, MBO framework, and environmental scanning.', topics: ['MBO (Management by Objectives)', 'Strategic Planning & Forecasting', 'Bounded Rationality by Herbert Simon', 'Decision-Making under Risk & Uncertainty', 'SWOT & PESTLE Analysis Frameworks'] },
          { number: 3, name: 'Organizing and Organizational Structures', description: 'Formal vs Informal organization, Line and staff authority, Matrix organization, Delegation and decentralization.', topics: ['Span of Control & Departmentation', 'Matrix Structure vs Functional Hierarchy', 'Centralization vs Decentralization', 'Authority, Responsibility & Delegation', 'Informal Organization Dynamics'] },
          { number: 4, name: 'Individual & Interpersonal Dynamics', description: 'Perception, Johari window, Maslow and Herzberg motivation theories, Big Five personality traits, and Transactional analysis.', topics: ['Maslow Hierarchy vs Herzberg Two-Factor Theory', 'Vroom Expectancy Theory', 'Johari Window Matrix', 'Big Five Personality Framework', 'Attitude Formation & Cognitive Dissonance'] },
          { number: 5, name: 'Group Dynamics, Leadership & Organizational Culture', description: 'Tuckman stages of team development, Transformational vs Transactional leadership, Blake-Mouton Managerial Grid, Conflict management.', topics: ['Tuckman Group Formation Stages', 'Blake & Mouton Managerial Grid', 'Transformational vs Transactional Leadership', 'Thomas-Kilmann Conflict Resolution Modes', 'Organizational Culture & Kotter 8-Step Change Model'] }
        ]
      },
      {
        code: 'BMB102',
        name: 'Managerial Economics & Market Structure',
        description: 'Microeconomic decision tools, demand forecasting, elasticity, production functions, pricing strategies, and macroeconomic indicators.',
        units: [
          { number: 1, name: 'Nature & Scope of Managerial Economics', description: 'Fundamental principles of opportunity cost, incremental concept, time perspective, and discounting principle.', topics: ['Opportunity Cost Principle', 'Marginal & Incremental Analysis', 'Equi-Marginal Principle', 'Discounting Principle', 'Role of Managerial Economist in Business'] },
          { number: 2, name: 'Demand Analysis & Forecasting', description: 'Law of demand, Price, Income and Cross elasticity of demand, Survey and statistical methods of demand forecasting.', topics: ['Price Elasticity & Revenue Relationship', 'Cross Elasticity & Substitute Goods', 'Income Elasticity & Engel Curves', 'Delphi Method of Demand Forecasting', 'Regression & Trend Projection Methods'] },
          { number: 3, name: 'Production & Cost Analysis', description: 'Law of variable proportions, Returns to scale, Cobb-Douglas production function, Short-run vs Long-run cost curves, Economies of scale.', topics: ['Law of Variable Proportions (Three Stages)', 'Cobb-Douglas Production Function', 'Isoquants & Isocost Lines', 'Internal & External Economies of Scale', 'Break-Even Analysis & Margin of Safety'] },
          { number: 4, name: 'Market Structures & Pricing Decisions', description: 'Perfect competition, Monopoly price discrimination, Monopolistic competition, Oligopoly and Kinked demand curve, Game theory basics.', topics: ['Price & Output Determination in Perfect Competition', 'First, Second & Third Degree Price Discrimination', 'Kinked Demand Curve Model of Oligopoly (Sweezy)', 'Nash Equilibrium & Prisoner Dilemma', 'Penetration vs Skimming Pricing Strategies'] },
          { number: 5, name: 'Macroeconomic Environment & Business Cycles', description: 'National income accounting (GDP, GNP, NNP), Inflation types and control, Monetary and fiscal policy, Keynesian multiplier.', topics: ['GDP vs GNP Measurement Methods', 'Demand-Pull vs Cost-Push Inflation', 'Fiscal Policy Tools & Taxation', 'RBI Monetary Policy & Repo Rate Mechanism', 'Business Cycle Phases & Stabilisation Policy'] }
        ]
      },
      {
        code: 'BMB103',
        name: 'Financial Accounting & Management Analysis',
        description: 'Double-entry bookkeeping principles, Trial balance, Final accounts with adjustments, Cash flow statement (AS-3), and Ratio analysis.',
        units: [
          { number: 1, name: 'Accounting Concepts & Double Entry System', description: 'GAAP principles, Entity concept, Going concern, Accrual basis, Journalising, Ledger posting, and Preparation of Trial Balance.', topics: ['GAAP Principles & Accounting Conventions', 'Double-Entry Bookkeeping Principles', 'Accrual vs Cash Basis of Accounting', 'Journal, Cash Book & Ledger Postings', 'Trial Balance Preparation & Suspense Account'] },
          { number: 2, name: 'Preparation of Final Accounts', description: 'Trading account, Profit & Loss account, Balance Sheet with adjustments for depreciation, bad debts, and prepaid expenses.', topics: ['Trading Account & Gross Profit Determination', 'Profit and Loss Account & Operating Income', 'Balance Sheet Marshalling (Order of Liquidity & Permanence)', 'Adjustments for Outstanding & Prepaid Expenses', 'Provision for Bad & Doubtful Debts'] },
          { number: 3, name: 'Depreciation & Inventory Valuation', description: 'Straight-line and Written-down value methods of depreciation, FIFO, LIFO, Weighted average inventory valuation (AS-2).', topics: ['Straight Line Method (SLM) vs WDV Method', 'AS-2 Valuation of Inventories (FIFO vs Weighted Average)', 'Provisions vs Reserves & Capital Reserves', 'Accounting for Intangibles & Amortisation', 'Bank Reconciliation Statement (BRS)'] },
          { number: 4, name: 'Financial Statement Analysis & Ratios', description: 'Comparative & Common-size statements, Trend analysis, Liquidity, Solvency, Turnover, and Profitability ratios, DuPont analysis.', topics: ['Current Ratio & Quick / Acid-Test Ratio', 'Debt-Equity Ratio & Interest Coverage Ratio', 'Inventory Turnover & Debtors Collection Period', 'Gross Margin & Net Profit Ratio', 'DuPont Return on Equity (ROE) Decomposition'] },
          { number: 5, name: 'Cash Flow Statement & Working Capital', description: 'AS-3 indirect method for cash from operating, investing, and financing activities, Concept and determinants of working capital.', topics: ['Cash Flow from Operating Activities (Indirect Method)', 'Cash from Investing & Financing Activities', 'Cash Flow Statement vs Funds Flow Statement', 'Working Capital Operating Cycle Concept', 'Schedule of Changes in Working Capital'] }
        ]
      }
    ];

    const sampleFile = await mongoose.connection.db.collection('academicfiles').findOne();
    const fileId = sampleFile ? sampleFile._id : new mongoose.Types.ObjectId();

    for (const subData of bmbSubjects) {
      let sub = await Subject.findOne({ code: subData.code, semester_id: semester._id });
      if (!sub) {
        sub = await Subject.create({
          semester_id: semester._id,
          code: subData.code,
          name: subData.name,
          description: subData.description,
          units: subData.units,
          is_published: true,
          sort_order: 1,
        });
        console.log('[Seed BMB] Created Subject:', sub.code);
      } else {
        sub.units = subData.units;
        sub.is_published = true;
        await sub.save();
      }

      // Seed past papers for BMB subjects
      for (const year of [2024, 2023, 2022]) {
        const paperExists = await ExaminationPaper.findOne({ subject_id: sub._id, exam_year: year });
        if (!paperExists) {
          await ExaminationPaper.create({
            subject_id: sub._id,
            file_id: fileId,
            exam_year: year,
            exam_type: 'regular',
            processing_status: 'completed',
            is_included_in_analysis: true,
          });
        }
      }

      // Seed important topics for BMB subjects
      for (const unit of subData.units) {
        for (const topicName of unit.topics) {
          const topExists = await ImportantTopic.findOne({ subject_id: sub._id, topic_name: topicName });
          if (!topExists) {
            await ImportantTopic.create({
              subject_id: sub._id,
              topic_name: topicName,
              unit: `Unit ${unit.number}: ${unit.name}`,
              priority: 'high',
              historical_appearances: Math.floor(Math.random() * 4) + 2,
              appeared_years: [2024, 2023, 2022],
              common_marks_pattern: '10-15 Marks',
              is_published: true,
            });
          }
        }
      }
    }

    console.log('[Seed BMB] Done! Both BMC and BMB now have full active curriculum data.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed BMB Error]:', err);
    process.exit(1);
  }
}

seedBmb();
