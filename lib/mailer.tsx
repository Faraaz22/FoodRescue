import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendClaimNotification(
  restaurantEmail: string,
  restaurantName: string,
  shelterName: string,
  foodDescription: string,
  pickupStart: Date,
  pickupEnd: Date,
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: restaurantEmail,
    subject: "Your surplus food has been claimed!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Food Claimed - FoodRescue Lite</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: #10b981; color: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Great News, ${restaurantName}!</h1>
          </div>
          <div class="content">
            <div class="highlight">
              <h2>Your food donation has been claimed by ${shelterName}</h2>
            </div>
            
            <div class="details">
              <h3>📋 Donation Details:</h3>
              <ul>
                <li><strong>Food Description:</strong> ${foodDescription}</li>
                <li><strong>Pickup Window:</strong> ${pickupStart.toLocaleString()} - ${pickupEnd.toLocaleString()}</li>
                <li><strong>Claimed By:</strong> ${shelterName}</li>
              </ul>
            </div>

            <p>Thank you for your commitment to reducing food waste and helping feed people in need. Your contribution makes a real difference in our community!</p>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Prepare the food for pickup during the specified window</li>
              <li>Ensure the food is properly packaged and labeled</li>
              <li>Have the food ready at your specified pickup location</li>
            </ul>

            <div class="footer">
              <p>Keep up the great work!</p>
              <p><strong>FoodRescue Lite Team</strong></p>
              <p><em>Connecting surplus food with those who need it most</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export async function sendWelcomeEmail(userEmail: string, userName: string, userRole: "restaurant" | "shelter") {
  const roleSpecificContent =
    userRole === "restaurant"
      ? {
          title: "Welcome to FoodRescue Lite - Start Donating Today!",
          content: `
          <p>As a restaurant partner, you can now:</p>
          <ul>
            <li>📝 Post surplus food donations with pickup details</li>
            <li>📊 Track your impact with real-time metrics</li>
            <li>🔔 Get notified instantly when shelters claim your food</li>
            <li>📈 See how many meals you've helped provide</li>
          </ul>
          <p>Ready to make your first donation? Log in to your dashboard and start posting surplus food today!</p>
        `,
        }
      : {
          title: "Welcome to FoodRescue Lite - Start Claiming Food!",
          content: `
          <p>As a shelter partner, you can now:</p>
          <ul>
            <li>🍽️ Browse available food donations from local restaurants</li>
            <li>⚡ Claim food instantly with one click</li>
            <li>📍 See pickup locations and time windows</li>
            <li>📊 Track how much food you've rescued</li>
          </ul>
          <p>Ready to start claiming food? Log in to your dashboard and browse available donations!</p>
        `,
        }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: roleSpecificContent.title,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FoodRescue Lite</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: #10b981; color: white; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Welcome to FoodRescue Lite!</h1>
          </div>
          <div class="content">
            <div class="highlight">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for joining our mission to reduce food waste and feed people in need.</p>
            </div>
            
            <div class="features">
              ${roleSpecificContent.content}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" class="button">
                Go to Dashboard
              </a>
            </div>

            <div class="footer">
              <p><strong>Together, we can make a difference!</strong></p>
              <p><em>FoodRescue Lite Team</em></p>
              <p>Questions? Reply to this email and we'll help you get started.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export async function sendDailyDigest(
  userEmail: string,
  userName: string,
  userRole: "restaurant" | "shelter",
  stats: {
    totalKg: number
    totalMeals: number
    activePosts?: number
    claimedToday?: number
  },
) {
  const roleSpecificContent =
    userRole === "restaurant"
      ? {
          subject: "Your Daily Impact Report - FoodRescue Lite",
          content: `
          <h3>📊 Your Impact Today</h3>
          <div class="stats">
            <div class="stat-item">
              <strong>${stats.totalKg} kg</strong><br>
              <span>Total Food Donated</span>
            </div>
            <div class="stat-item">
              <strong>${stats.totalMeals}</strong><br>
              <span>Estimated Meals Provided</span>
            </div>
            <div class="stat-item">
              <strong>${stats.activePosts || 0}</strong><br>
              <span>Active Food Posts</span>
            </div>
          </div>
          <p>Keep up the amazing work! Every donation helps reduce waste and feeds people in need.</p>
        `,
        }
      : {
          subject: "Your Daily Activity Report - FoodRescue Lite",
          content: `
          <h3>📊 Your Impact Today</h3>
          <div class="stats">
            <div class="stat-item">
              <strong>${stats.totalKg} kg</strong><br>
              <span>Total Food Claimed</span>
            </div>
            <div class="stat-item">
              <strong>${stats.totalMeals}</strong><br>
              <span>Estimated Meals Secured</span>
            </div>
            <div class="stat-item">
              <strong>${stats.claimedToday || 0}</strong><br>
              <span>Items Claimed Today</span>
            </div>
          </div>
          <p>Thank you for helping rescue food and serving your community!</p>
        `,
        }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: roleSpecificContent.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Digest - FoodRescue Lite</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-item { text-align: center; background: white; padding: 20px; border-radius: 8px; margin: 0 5px; flex: 1; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Daily Impact Report</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            ${roleSpecificContent.content}
            
            <div class="footer">
              <p><strong>FoodRescue Lite</strong></p>
              <p><em>Making a difference, one meal at a time</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  return transporter.sendMail(mailOptions)
}

// Test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify()
    return { success: true, message: "Email configuration is valid" }
  } catch (error) {
    return { success: false, message: "Email configuration failed", error }
  }
}
