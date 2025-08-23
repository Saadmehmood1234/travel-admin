import { createTransport } from "nodemailer";

export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    totalAmount: number;
    deliveryDate?: string;
  }
) {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mailOptions = {
    from: `"Prime Flix" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Your PrimeFlix Order #${orderData.orderId}`,
    headers: {
      "X-Mailer": "PrimeFlix",
      "X-Priority": "1",
      Importance: "high",
    },
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Order Confirmation</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; }
        .header { background-color: #111827; padding: 30px 0; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 500; }
        .content { padding: 30px; background-color: #ffffff; }
        .order-number { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
        .thank-you { font-size: 16px; margin-bottom: 25px; }
        .order-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-items th { text-align: left; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; }
        .order-items td { padding: 15px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .product-image { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px; }
        .total-row { font-weight: 600; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 24px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Thank you for your order!</h1>
    </div>
    
    <div class="content">
        <div class="order-number">Order #${orderData.orderId}</div>
        <div class="thank-you">Hi there, thank you for shopping with PrimeFlix. Your order is confirmed and will be processed shortly.</div>
        
        <table class="order-items">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${orderData.items
                  .map(
                    (item) => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center;">
                            ${
                              item.image
                                ? `<img src="${item.image}" class="product-image" alt="${item.name}">`
                                : ""
                            }
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                    <td colspan="2" style="text-align: right;">Total:</td>
                    <td>$${orderData.totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        
        ${
          orderData.deliveryDate
            ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-radius: 4px;">
            <strong>Estimated delivery:</strong> ${orderData.deliveryDate}
        </div>
        `
            : ""
        }
        
        <div style="margin-top: 30px;">
            <a href="${
              process.env.NEXTAUTH_URL
            }/profile" class="button">View Your Order</a>
        </div>
        
        <div style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            <p>Need help with your order? Reply to this email or contact our <a href="${
              process.env.NEXTAUTH_URL
            }/contact" style="color: #111827;">customer support</a>.</p>
        </div>
    </div>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} PrimeFlix. All rights reserved.</p>
        <p>${process.env.NEXTAUTH_URL}</p>
    </div>
</body>
</html>
    `,
    text: `Order Confirmation #${orderData.orderId}

Thank you for your order at PrimeFlix!

Order Details:
${orderData.items
  .map(
    (item) =>
      `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`
  )
  .join("\n")}

Total: $${orderData.totalAmount.toFixed(2)}
${
  orderData.deliveryDate
    ? `Estimated Delivery: ${orderData.deliveryDate}\n`
    : ""
}

View your order: ${process.env.NEXTAUTH_URL}/account/orders

Need help? Reply to this email or visit ${process.env.NEXTAUTH_URL}/contact

© ${new Date().getFullYear()} PrimeFlix
${process.env.NEXTAUTH_URL}
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send order confirmation:", error);
    throw error;
  }
}
