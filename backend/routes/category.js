const postitem = require("../models/postItem");
const Order = require("../models/order");
const { requireSignin, userMiddleware } = require("../middleware");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const shortid = require("shortid");
const upload = multer();
const KeyPath = "/etc/secrets/service.json";
const fs = require("fs");
var aws = require("aws-sdk");
var multerS3 = require("multer-s3");
const path = require("path");
const stream = require("stream");
const { google } = require("googleapis");
const accesskey = process.env.AWSACCESSKEY
const awssecret = process.env.AWSSECRETACCESSKEY
const awsbucket = process.env.AWSBUCKET

//AWS S3 BUCKET METHOD:


// const AWS = new aws.S3({
//     accessKeyId: accesskey,
//     secretAccessKey: awssecret,
// });
// var uploadS3 = multer({
//     storage: multerS3({
//         s3: AWS,
//         bucket: awsbucket,
//         acl: "public-read",
//         metadata: function (req, file, cb) {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             cb(null, shortid.generate() + "-" + file.originalname + "-" + Date.now());
//         },
//     }),
// });

//GCP IMAGE UPLOAD METHOD

const SCOPES = [process.env.SCOPES_0, process.env.SCOPES_1];
const auth = new google.auth.GoogleAuth({
    keyFile: KeyPath,
    scopes: SCOPES
});

const uploadToGoogleDrive = async (fileObject) => {
    try {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);
        const response = await google.drive({ version: "v3", auth }).files.create({
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
            requestBody: {
                name: fileObject.originalname,
                parents: [process.env.GOOGLE_FOLDER_ID],
            },
            fields: "id,name",
        });
        return response.data;
    } catch (error) {
        const uploadsDir = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const safeName = `${Date.now()}-${shortid.generate()}-${fileObject.originalname}`.replace(/\s+/g, "-");
        const outputPath = path.join(uploadsDir, safeName);
        fs.writeFileSync(outputPath, fileObject.buffer);
        return { id: `local:${safeName}`, name: fileObject.originalname };
    }
};

router.post(
    "/postitem",
    requireSignin,
    userMiddleware,
    // uploadS3.array("itemPicture") /* AWS S3 Bucket upload method calling */
    upload.array("itemPictures"),
    async (req, res) => {
        // console.log(req)
        console.log("Hitted the POST successfully ");
        try {
            console.log("try");
            const { ItemType, ItemName, Price, Quantity } = req.body;
            // console.log(req.files);
            console.log(ItemType);
            console.log(req.files);
            console.log(req.body);
            const { body, files = [] } = req;
            console.log(body);
            let itemPictures = [];
            for (const file of files) {
                itemPictures.push(await uploadToGoogleDrive(file));
            }
            //Saving data to db

            const newPost = await postitem.create({
                itemname: ItemName,
                itemtype: ItemType,
                itemPictures: itemPictures,
                price: Price,
                availableQuantity: Quantity,
                createdBy: req.user._id,
            });
            console.log(newPost._id);
            await newPost.save();
            console.log("save completed");
            res.status(201).json({ message: "done" });
        } catch (err) {
            console.log(err);
            res.status(401).json({
                "Message is": err.message,
            });
        }
    }
);

router.get("/get-item", async (req, res) => {
    let data = [];
    stateInfo = req.body.stateInfo;
    const url = `https://vegetablemarketprice.com/market/${stateInfo}/today`;
    const response = await fetch(url);
    const body = await response.text()
    const $ = cheerio.load(body);
    console.log("vegetable names");
    $('tr').each((_, e) => {
        let _1 = $(e).find('td:nth-child(2)').text().replace(/(\s+)/g, ' ');
        let _2 = $(e).find('td:nth-child(3)').text().replace(/(\s+)/g, ' ');
        let _3 = $(e).find('td:nth-child(4)').text().replace(/(\s+)/g, ' ');
        let _4 = $(e).find('td:nth-child(5)').text().replace(/(\s+)/g, ' ');
        let _5 = $(e).find('td:nth-child(6)').text().replace(/(\s+)/g, ' ');
        data.push({
            vegetable_names: _1,
            wholesale_price: _2,
            retail_price: _3,
            shoppingmall_price: _4,
            units: _5
        });
    });
    res.json(data);
})

router.get("/getitem", (req, res) => {
    // postitem.find({}).exec((err, postitems) => {
    //     if (err) return res.status(400).json({ err });
    //     if (postitems) {

    //         res.status(200).json({
    //             postitems,
    //         });
    //     }
    // });
    postitem.find({}).exec()
        .then((response) => {
            // console.log(response);
            res.json({
                response
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(400).json({ err });
        })
});

router.get("/item/:id", (req, res) => {
    const { id } = req.params;
    // console.log(id)
    postitem.find({ _id: id }).exec((err, item) => {
        if (err) return res.status(400).json({ Error: err });
        // console.log(item)
        messageschema.find({ itemId: item[0]._id }).exec((err, answers) => {
            if (err) return res.status(400).json({ Error: err });

            // console.log(answers)
            res.status(200).json({
                Item: item,
                Answers: answers,
            });
        });
    });
});


router.post("/deleteitem", async (req, res) => {
    const { id } = req.body;
    console.log("Item id is :", id);
    try {
        const deleteitem = await postitem.findOneAndDelete({ _id: id });
        res.status(200).json({
            body: req.body,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json(
            {
                "err": "Something went wrong!!"
            }
        )
    }
});

router.get("/getnumber/:id", (req, res) => {
    const { id } = req.params;
    console.log("Id is :", id);
    SignUp.find({ _id: id }).exec((err, user) => {
        res.status(200).json({
            Number: user[0].number,
        });
    });
});

router.get("/getquestion/:id", (req, res) => {
    const { id } = req.params;
    console.log("Id is :", id);
    postitem.find({ _id: id }).exec((err, item) => {
        if (err) return res.status(400).json({ Error: err });

        // console.log(item)
        // console.log(item[0].createdBy)
        const createdBy = item[0].createdBy;
        SignUp.find({ _id: createdBy }).exec((err, user) => {
            res.status(200).json({
                Question: user[0].number,
            });
        });
    });
});

router.post("/submitAnswer", async (req, res) => {
    console.log(req.body);
    const { itemId, question, answer, givenBy, belongsTo } = req.body;


    const newmessage = await messageschema.create({
        itemId: itemId,
        belongsTo: belongsTo,
        question: question,
        answer: answer,
        givenBy: givenBy,
    });
    newmessage.save((error, item) => {
        if (error) return res.status(400).json({ error });
        if (item) return res.status(201).json({ item });
    });
});

router.get("/myresponses/:id", (req, res) => {
    const { id } = req.params;
    console.log("Used Id is :", id);
    messageschema.find({ givenBy: id }).exec((err, item) => {
        if (err) return res.status(400).json({ Error: err });

        console.log(item);
        res.status(200).json({
            item: item,
        });
    });
});

router.get("/mylistings/:id", (req, res) => {
    const { id } = req.params;
    console.log("Used Id is :", id);
    postitem.find({ createdBy: id }).exec((err, item) => {
        if (err) return res.status(400).json({ Error: err });

        // console.log(item)
        res.status(200).json({
            item: item,
        });
    });
});

router.post("/confirmResponse/:id", (req, res) => {
    const { id } = req.params;
    // console.log("Used Id is :",id)
    console.log(id);
    console.log(req.body);
    messageschema.updateOne(
        { _id: id },
        { $set: { response: req.body.response } },
        { upsert: false },
        (err, updatedMessage) => {
            if (err) return res.status(400).json({ msg: err });

            res.status(200).json({ msg: "Updated" });
        }
    );
});

// PLACE ORDER ROUTE
router.post("/place-order", async (req, res) => {
    try {
        const { productId, productName, price, sellerId: bodySellerId, buyerName, buyerPhone, quantity, city, state, pinCode } = req.body;
        console.log("Received place-order request:", req.body);

        if (!buyerName || !buyerPhone || !quantity || !city || !state || !pinCode) {
            return res.status(400).json({ error: "Missing required order details." });
        }

        const orderQty = Number(quantity);
        if (isNaN(orderQty) || orderQty <= 0) {
            return res.status(400).json({ error: "Invalid order quantity." });
        }

        let item = null;
        if (productId) {
            try {
                item = await postitem.findById(productId);
            } catch (e) {
                try {
                    item = await postitem.findOne({ _id: productId });
                } catch (e2) {
                    item = null;
                }
            }
        }

        if (!item && productName) {
            try {
                item = await postitem.findOne({ itemname: new RegExp(`^${productName.trim()}$`, "i") });
            } catch (e) {
                item = null;
            }
        }

        let finalProductName = productName || (item ? item.itemname : "Crop Produce");
        let unitPrice = Number(price || (item ? item.price : 100));
        let sellerId = bodySellerId || (item ? item.createdBy : "600000000000000000000000") || "600000000000000000000000";
        let targetProductId = item ? item._id : (productId || "600000000000000000000000");

        let newStock = 0;
        if (item) {
            const currentStock = Number(
                item.availableQuantity !== undefined && item.availableQuantity !== null
                    ? item.availableQuantity
                    : (item.quantity !== undefined ? item.quantity : 100)
            );

            if (orderQty > currentStock && currentStock > 0) {
                return res.status(400).json({ error: `Order quantity exceeds available stock (${currentStock} KGs available).` });
            }

            newStock = Math.max(0, currentStock - orderQty);
            await postitem.updateOne(
                { _id: item._id },
                { $set: { availableQuantity: newStock } }
            );
        }

        const totalAmount = unitPrice * orderQty;

        const newOrder = await Order.create({
            productId: targetProductId,
            productName: finalProductName,
            sellerId: sellerId,
            buyerName: String(buyerName).trim(),
            buyerPhone: String(buyerPhone).trim(),
            quantity: orderQty,
            price: unitPrice,
            totalAmount: totalAmount,
            deliveryAddress: {
                city: String(city).trim(),
                state: String(state).trim(),
                pinCode: String(pinCode).trim(),
            },
            status: "Confirmed",
            orderDate: new Date(),
        });

        console.log("Order placed successfully:", newOrder._id);

        res.status(201).json({
            message: "Order placed successfully!",
            order: newOrder,
            updatedStock: newStock,
        });
    } catch (err) {
        console.error("Place order error detailed:", err);
        res.status(500).json({ error: err.message || "Internal server error." });
    }
});

// GET FARMER ORDERS ROUTE
router.get("/farmer-orders/:farmerId", async (req, res) => {
    try {
        const { farmerId } = req.params;
        let query = {};
        if (farmerId && farmerId !== "all" && farmerId !== "undefined") {
            query = {
                $or: [
                    { sellerId: farmerId },
                    { sellerId: String(farmerId) }
                ]
            };
        }
        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.status(200).json({ orders });
    } catch (err) {
        console.error("Get farmer orders error:", err);
        res.status(500).json({ error: err.message || "Internal server error." });
    }
});

module.exports = router;
