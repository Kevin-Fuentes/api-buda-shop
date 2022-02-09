require("dotenv").config();
const express = require("express");
const app = express();
const Buda = require("buda-promise");
const {BUDA_API_KEY,BUDA_API_SECRET } = process.env


const privateBuda = new Buda(BUDA_API_KEY, BUDA_API_SECRET);

const getAmount = async (currency) => {
  const {
    balance: { available_amount },
     } = await privateBuda.balance(currency);
  const { 0: amount } = available_amount;
  return amount;
};

const newOrder = async ({ market, type, price_type, limit, amount }) => {
  const order = await privateBuda.new_order(
    market,
    type,
    price_type,
    limit,
    amount
  );
  return order;
};


app.use("/ventas", async (req, res) => {
  const { btc = 0.000021, cop = 4000 } = req.query;

     const validateAmount = await getAmount('btc');
              
     if ( btc >= validateAmount  && validateAmount < 0.000021) {
       return res.json({
         message: "No tienes suficientes BTC para realizar esta venta",
       });
     }
   
     try {
       const order = await newOrder("btc-cop", "ask", "limit", btc,cop);
      return res
         .json({
           order,
           ok: true,
         })
         .statusCode(200);
     } catch (error) {
      return res.json({ message: error.message, ok: false }).statusCode(400);
     }
   });

   

app.use("/compras", async (req, res) => {
  const { btc, cop } = req.query;
     const validateAmount = await getAmount('cop');
  if ( cop >= validateAmount &&  validateAmount > 3500.00) {
    return res.json({
      message: "Tu saldo no es suficiente para realizar una nueva orden",
    });
  }

  try {
    const order = await newOrder("btc-cop", "Ask", "limit", btc,cop);
   return res
      .json({
        order,
        ok: true,
      })
      .statusCode(200);
  } catch (error) {
    return res.json({ message: error.message, ok: false }).statusCode(400);
  }
});

app.use("/", async (req, res) => {
  const amount = await getAmount('cop');
  return res.json({
    message: "Bienvenido a la api de buda",
    amount: `Tu saldo disponible es: ${amount}`,
  });
});

app.listen(3000, () => {
  console.log("server on port:", 3000);
});
