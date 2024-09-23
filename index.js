import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";

dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // initailzing Stripe with Api

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      // list of items that are to be purchased
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Node.js and Express.js Book",
          },
          unit_amount: 50 * 100,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "React.js and Next.js Book",
          },
          unit_amount: 20 * 100,
        },
        quantity: 2,
      },
    ],
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US", "BR", "PK", "IN"], // countries that are allowed to order || service providing in these countries
    },
    success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`, // this query parameter will provide session_id to /complete route so that all info can be retrieved through this id.
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });

  console.log(session);
  res.redirect(session.url); // checkout page provided by stripe
});

app.get("/complete", async (req, res) => {
  const PaymentInfo = await stripe?.checkout?.sessions?.retrieve(
    // to retrieve payment info from session_id
    req?.query?.session_id,
    {
      expand: ["payment_intent.payment_method"],
    }
  );
  const ListItemInfo = await stripe?.checkout?.sessions?.listLineItems(
    // to retrieve List Items info(items that are purchased) from session_id
    req?.query?.session_id
  );
  console.log(PaymentInfo, ListItemInfo);

  res.render("confetti.ejs"); // success page after payment
});

app.get("/cancel", (req, res) => {
  res.redirect("/"); // cancel page (if someone press back button during checkout, it will redirect to home page)
});

app.listen(8080, () => {
  console.log("Server Running at port 8080");
});
