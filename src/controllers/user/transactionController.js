const Transaction = require('../../models/transaction');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const {
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      export: exportFormat
    } = req.query;

    const filter = { userId };

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Sort config
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Export logic
    if (exportFormat === 'csv') {
      const fields = ['status', 'amount', 'currency', 'paymentIntentId', 'createdAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(transactions);
      res.header('Content-Type', 'text/csv');
      res.attachment('transactions.csv');
      return res.send(csv);
    }

    if (exportFormat === 'pdf') {
      const doc = new PDFDocument();
      const tempPath = path.join(__dirname, `../temp/transactions-${userId}.pdf`);
      const stream = fs.createWriteStream(tempPath);
      doc.pipe(stream);

      doc.fontSize(18).text('Transaction Report', { align: 'center' });
      doc.moveDown();

      transactions.forEach((tx, i) => {
        doc.fontSize(10).text(`${i + 1}. ${tx.status} | $${parseFloat(tx.amount).toFixed(2)} | ${tx.currency.toUpperCase()} | ${tx.createdAt.toDateString()}`);
      });

      doc.end();

      stream.on('finish', () => {
        res.download(tempPath, `transactions-${userId}.pdf`, (err) => {
          if (!err) fs.unlinkSync(tempPath);
        });
      });

      return;
    }

    // Default JSON response
    res.status(200).json({
      total,
      page,
      limit,
      transactions
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};


/**
 * ✅ Supported Query Parameters
Param	    Description
status	    Filter by status (success, failed, etc.)
startDate	ISO date string (e.g., 2024-01-01)
endDate	    ISO date string
sortBy	    amount, status, createdAt
sortOrder	asc or desc
export	    csv or pdf
 */
/**
 * GET /user/transactions?status=success&sortBy=amount&sortOrder=desc
GET /user/transactions?startDate=2024-01-01&endDate=2024-12-31&export=csv
GET /user/transactions?page=2&limit=10&export=pdf

npm install json2csv pdfkit

 */