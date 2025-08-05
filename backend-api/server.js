// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); // Using the promise-based API
const cors = require('cors');
const moment = require('moment');
const nodemailer = require('nodemailer'); // Import nodemailer
const cron = require('node-cron'); // Import node-cron

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database!');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err.message);
        process.exit(1);
    });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

// Function to send an event reminder email
async function sendEventReminderEmail(recipientEmail, eventTitle, eventStartTime, notificationTime) {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: recipientEmail,
        subject: `Reminder: Your Event "${eventTitle}" is starting soon!`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4a4a4a;">Event Reminder!</h2>
                <p>Hi there,</p>
                <p>Just a friendly reminder that your event <strong>"${eventTitle}"</strong> is scheduled to start at <strong>${moment(eventStartTime).format('h:mm A on MMMM Do,YYYY')}</strong>.</p>
                <p>This reminder was sent ${notificationTime} minutes before the event.</p>
                <p>Don't miss it!</p>
                <br>
                <p>Best regards,</p>
                <p>Your Calendar App Team</p>
                <div style="margin-top: 20px; font-size: 0.8em; color: #777;">
                    If you no longer wish to receive these reminders, you can manage your preferences in the app.
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Scheduled reminder email sent to ${recipientEmail} for event "${eventTitle}"`);
    } catch (error) {
        console.error(`Failed to send scheduled reminder email to ${recipientEmail} for event "${eventTitle}":`, error);
    }
}

// Function to send a subscription confirmation email
async function sendSubscriptionConfirmationEmail(subscriberEmail, firstName, lastName, notificationTime) {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: subscriberEmail,
        subject: `Welcome to NCT Scheduling Hub Event Reminders!`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4a4a4a;">Hello ${firstName},</h2>
                <p>Thank you for subscribing to NCT Scheduling Hub Event Reminders!</p>
                <p>You've successfully set up reminders to be sent <strong>${notificationTime} minutes before</strong> your scheduled events.</p>
                <p>We're excited to help you stay on top of your schedule.</p>
                <p>If you need to change your preferences or unsubscribe at any time, please visit the settings in your NCT Scheduling Hub application.</p>
                <br>
                <p>Best regards,</p>
                <p>The NCT Scheduling Hub Team</p>
                <div style="margin-top: 20px; font-size: 0.8em; color: #777;">
                    This is an automated email. Please do not reply.
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Subscription confirmation email sent to ${subscriberEmail}`);
    } catch (error) {
        console.error(`Failed to send subscription confirmation email to ${subscriberEmail}:`, error);
    }
}

// NEW: Function to send an immediate event creation/update confirmation email
async function sendEventConfirmationEmail(recipientEmail, eventTitle, eventStartTime, eventEndTime, eventLocation) {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: recipientEmail,
        subject: `Confirmation: Your Event "${eventTitle}" is Scheduled!`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4a4a4a;">Event Confirmation!</h2>
                <p>Hi there,</p>
                <p>This email confirms that your event <strong>"${eventTitle}"</strong> has been successfully created/updated.</p>
                <p><strong>Details:</strong></p>
                <ul>
                    <li><strong>Event Name:</strong> ${eventTitle}</li>
                    <li><strong>Starts:</strong> ${moment(eventStartTime).format('h:mm A on MMMM Do,YYYY')}</li>
                    <li><strong>Ends:</strong> ${moment(eventEndTime).format('h:mm A on MMMM Do,YYYY')}</li>
                    ${eventLocation ? `<li><strong>Location:</strong> ${eventLocation}</li>` : ''}
                </ul>
                <p>You're all set!</p>
                <br>
                <p>Best regards,</p>
                <p>The NCT Scheduling Hub Team</p>
                <div style="margin-top: 20px; font-size: 0.8em; color: #777;">
                    This is an automated email. Please do not reply.
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Event creation/update confirmation email sent to ${recipientEmail} for event "${eventTitle}"`);
    } catch (error) {
        console.error(`Failed to send event confirmation email to ${recipientEmail} for event "${eventTitle}":`, error);
    }
}


// API Routes

// GET all events
app.get('/api/events', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY start_time ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

// POST a new event
app.post('/api/events', async (req, res) => {
  const { title, start_time, end_time, color, calendar_type, location, event_recipient_email, enable_event_reminder } = req.body;

  if (!title || !start_time || !end_time || !calendar_type || !event_recipient_email) { // event_recipient_email is now mandatory
      return res.status(400).json({ message: 'Missing required event fields (title, start_time, end_time, calendar_type, event_recipient_email).' });
  }

  const formattedStartTime = moment(start_time).format('YYYY-MM-DD HH:mm:ss');
  const formattedEndTime = moment(end_time).format('YYYY-MM-DD HH:mm:ss');
  const enableReminderBoolean = Boolean(enable_event_reminder); // Ensure boolean

  try {
    const query = 'INSERT INTO events (title, start_time, end_time, color, calendar_type, location, event_recipient_email, enable_event_reminder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await pool.execute(
      query,
      [title, formattedStartTime, formattedEndTime, color, calendar_type, location, event_recipient_email, enableReminderBoolean]
    );

    // Send immediate confirmation email
    await sendEventConfirmationEmail(event_recipient_email, title, formattedStartTime, formattedEndTime, location);

    res.status(201).json({
      id: result.insertId,
      title,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      color,
      calendar_type,
      location,
      event_recipient_email,
      enable_event_reminder: enableReminderBoolean // Return the boolean
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Failed to add event', details: error.message });
  }
});

// PUT (update) an existing event
app.put('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const { title, start_time, end_time, color, calendar_type, location, event_recipient_email, enable_event_reminder } = req.body;

    if (!title || !start_time || !end_time || !calendar_type || !event_recipient_email) { // event_recipient_email is now mandatory
        return res.status(400).json({ message: 'Missing required event fields for update.' });
    }

    const formattedStartTime = moment(start_time).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndTime = moment(end_time).format('YYYY-MM-DD HH:mm:ss');
    const enableReminderBoolean = Boolean(enable_event_reminder); // Ensure boolean

    try {
        const query = 'UPDATE events SET title = ?, start_time = ?, end_time = ?, color = ?, calendar_type = ?, location = ?, event_recipient_email = ?, enable_event_reminder = ? WHERE id = ?';
        const [result] = await pool.execute(
            query,
            [title, formattedStartTime, formattedEndTime, color, calendar_type, location, event_recipient_email, enableReminderBoolean, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Send immediate confirmation email on update
        await sendEventConfirmationEmail(event_recipient_email, title, formattedStartTime, formattedEndTime, location);

        res.status(200).json({
            message: 'Event updated successfully',
            id,
            title,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            color,
            calendar_type,
            location,
            event_recipient_email,
            enable_event_reminder: enableReminderBoolean
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event', details: error.message });
    }
});

// DELETE an event
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM events WHERE id = ?';
        const [result] = await pool.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event', details: error.message });
    }
});

// NEW: POST endpoint to handle subscription requests (for general reminders)
app.post('/api/subscribe', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, notificationTime } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !notificationTime) {
        return res.status(400).json({ message: 'Missing required subscription fields (firstName, lastName, email, notificationTime).' });
    }

    try {
        // Check if email already exists to prevent duplicate entries
        const [existingSubscriptions] = await pool.query('SELECT id FROM subscriptions WHERE email = ?', [email]);
        if (existingSubscriptions.length > 0) {
            // Update existing subscription
            const updateQuery = 'UPDATE subscriptions SET first_name = ?, last_name = ?, phone_number = ?, notification_time = ?, created_at = CURRENT_TIMESTAMP WHERE email = ?';
            await pool.execute(updateQuery, [firstName, lastName, phoneNumber, notificationTime, email]);
            // Send confirmation email even on update
            await sendSubscriptionConfirmationEmail(email, firstName, lastName, notificationTime);
            return res.status(200).json({ message: 'Subscription updated successfully.', email });
        } else {
            // Insert new subscription
            const insertQuery = 'INSERT INTO subscriptions (first_name, last_name, email, phone_number, notification_time) VALUES (?, ?, ?, ?, ?)';
            const [result] = await pool.execute(insertQuery, [firstName, lastName, email, phoneNumber, notificationTime]);
            // Send confirmation email on new subscription
            await sendSubscriptionConfirmationEmail(email, firstName, lastName, notificationTime);
            return res.status(201).json({
                message: 'Subscription created successfully.',
                id: result.insertId,
                firstName,
                lastName,
                email,
                phoneNumber,
                notificationTime
            });
        }
    } catch (error) {
        console.error('Error handling subscription:', error);
        res.status(500).json({ error: 'Failed to handle subscription', details: error.message });
    }
});

// CRON JOB: Schedule to check for upcoming events and send reminders
// This task will run every minute (you can adjust the schedule as needed)
cron.schedule('* * * * *', async () => {
    console.log('Running scheduled reminder check...');
    const currentTime = moment();

    try {
        // Fetch all events that are enabled for reminders
        // Filter events that have not been reminded yet within the last minute (to prevent duplicates within a single minute cron run)
        // Or if you only want ONE reminder ever per event, use IS NULL. For now, it sends one reminder at the chosen time.
        const [eventsToRemind] = await pool.query(
            `SELECT id, title, start_time, event_recipient_email, enable_event_reminder
             FROM events
             WHERE enable_event_reminder = TRUE
             AND event_recipient_email IS NOT NULL
             AND (last_event_reminder_sent_at IS NULL OR last_event_reminder_sent_at < DATE_SUB(NOW(), INTERVAL 1 MINUTE))`
        );

        console.log(`Found ${eventsToRemind.length} events potentially needing reminders.`);

        for (const event of eventsToRemind) {
            // We need the notification_time from the subscription associated with this event_recipient_email
            // This means an event reminder will only be sent if the recipient has a global subscription.
            // If you want to allow event-specific reminders even without a global subscription,
            // you'd need to add 'notification_time' directly to the 'events' table.
            const [recipientSubscription] = await pool.query(
                'SELECT notification_time FROM subscriptions WHERE email = ?',
                [event.event_recipient_email]
            );

            if (recipientSubscription.length > 0) {
                const reminderOffsetMinutes = recipientSubscription[0].notification_time;
                const eventStartTime = moment(event.start_time);
                const reminderTime = eventStartTime.clone().subtract(reminderOffsetMinutes, 'minutes');

                // Check if current time is within the reminder window for this specific event and its subscriber's preference
                // We give it a 1-minute window to catch it
                if (currentTime.isSameOrAfter(reminderTime.clone().subtract(1, 'second')) && currentTime.isBefore(reminderTime.clone().add(1, 'minute'))) {
                    console.log(`Triggering reminder for event "${event.title}" to ${event.event_recipient_email}. Event starts at ${eventStartTime.format('YYYY-MM-DD HH:mm:ss')}. Reminder time: ${reminderTime.format('YYYY-MM-DD HH:mm:ss')}.`);
                    await sendEventReminderEmail(event.event_recipient_email, event.title, event.start_time, reminderOffsetMinutes);

                    // Update last_event_reminder_sent_at to prevent multiple reminders for the same window
                    await pool.execute(
                        'UPDATE events SET last_event_reminder_sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [event.id]
                    );
                }
            } else {
                console.log(`No active subscription found for ${event.event_recipient_email}. Skipping scheduled reminder for event "${event.title}".`);
            }
        }
    } catch (error) {
        console.error('Error in scheduled reminder task:', error);
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
})
