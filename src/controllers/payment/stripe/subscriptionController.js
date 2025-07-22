const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use your secret key from Stripe dashboard
const { Op } = require('sequelize');
const { StripeSubscriptionModel, User, StripePaidSubscriptionModel,StripeSubscriptionHistoriesModel } = require('../../../models');

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      amount,
      interval,
      interval_count,
      currency,
      description,
      metadata,
      images = [], // default empty array if not provided
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    const validImages = images.filter(image => image.trim() !== "");


    const product = await stripe.products.create({
      name,
      description,
      metadata,
      images:validImages,
      active: true,
      default_price_data: {
        currency,
        unit_amount: amount * 100, // amount in dollar
        recurring: {
          interval,
          interval_count,
        },
      },
    });

    await StripeSubscriptionModel.create({
      stripe_product_id: product.id,
      stripe_price_id: product.default_price,
      name: product.name,
      description: product.description,
      currency,
      amount,
      images,
      interval,
      interval_count,
      metadata: product.metadata,
      is_active: product.active,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Stripe Product Creation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// Update an existing product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      metadata,
      active,
      images = [], // Accept images in update too
    } = req.body;

      // Update the product
      const product = await stripe.products.update(id, {
        name,
        description,
        metadata,
        active,
      });

    // Try to update the price's active flag
    if (product.default_price) {
      try {
        await stripe.prices.update(product.default_price, {
          active,
        });
      } catch (err) {
        console.warn(`Could not update price ${product.default_price}:`, err.message);
        // optionally return a warning in response or just log
      }
    }

      const prices = await stripe.prices.list({ product: product.id, limit: 100 });
      for (const price of prices.data) {
        await stripe.prices.update(price.id, { active: active });
        // if (price.active) {
        //   try {
        //   } catch (err) {
        //     console.warn(`Could not archive price ${price.id}:`, err.message);
        //   }
        // }
      }

    await StripeSubscriptionModel.update(
      {
        name: product.name,
        description: product.description,
        metadata: product.metadata,
        is_active: product.active,
      },
      { where: { stripe_product_id: product.id } }
    );

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Stripe Product Update Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get a single product by ID
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await stripe.products.retrieve(id);

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Stripe Product Retrieval Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// List all products

exports.listProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const subscriptions = await StripeSubscriptionModel.findAll({
      // where: { is_active: true },
      limit,
    });

    const formattedProducts = subscriptions.map(sub => ({
      id: sub.stripe_product_id,
      object: "product",
      active: sub.is_active,
      attributes: [],
      created: Math.floor(new Date(sub.created_at).getTime() / 1000), // UNIX timestamp
      default_price: sub.stripe_price_id,
      description: sub.description,
      images: sub.images || [],
      livemode: false,
      marketing_features: [],
      metadata: sub.metadata || {},
      name: sub.name,
      package_dimensions: null,
      shippable: null,
      statement_descriptor: null,
      tax_code: null,
      type: "service",
      unit_label: null,
      updated: Math.floor(new Date(sub.created_at).getTime() / 1000), // Using created_at for updated as well
      url: null,
    }));

    res.status(200).json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("DB Product List Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.ActiveSubscriptionList = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const subscriptions = await StripeSubscriptionModel.findAll({
      where: {
        is_active: true,
      },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const enrichedSubscriptions = await Promise.all(subscriptions.map(async (sub) => {
      let priceDetails = null;
      if (sub.stripe_price_id) {
        priceDetails = await stripe.prices.retrieve(sub.stripe_price_id);
      }

      return {
        id: sub.stripe_product_id,
        object: 'product',
        active: sub.is_active,
        amount: sub.amount,
        attributes: [],
        created: Math.floor(new Date(sub.created_at).getTime() / 1000),
        default_price: sub.stripe_price_id,
        description: sub.description,
        images: sub.images || [],
        livemode: false,
        marketing_features: [],
        metadata: sub.metadata || {},
        name: sub.name,
        package_dimensions: null,
        shippable: null,
        statement_descriptor: null,
        tax_code: null,
        type: 'service',
        unit_label: null,
        updated: Math.floor(new Date(sub.created_at).getTime() / 1000),
        url: null,
        price_details: priceDetails,
      };
    }));

    res.status(200).json({
      success: true,
      page,
      products: enrichedSubscriptions,
    });
  } catch (error) {
    console.error('Stripe Subscription List Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a product by ID
exports.deactivateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Unset default price to allow price updates
    const product = await stripe.products.retrieve(id);
    if (product.default_price) {
      await stripe.products.update(id, { default_price: null });
    }

    // Step 2: Deactivate all associated prices
    const prices = await stripe.prices.list({ product: id, limit: 100 });
    for (const price of prices.data) {
      if (price.active) {
        try {
          await stripe.prices.update(price.id, { active: false });
        } catch (err) {
          console.warn(`Could not archive price ${price.id}:`, err.message);
        }
      }
    }

    // Step 3: Deactivate product instead of deleting
    const updatedProduct = await stripe.products.update(id, { active: false });

    // Step 4: Reflect in DB
    await StripeSubscriptionModel.update(
      { is_active: false },
      { where: { stripe_product_id: id } }
    );

    res.status(200).json({ success: true, message: 'Product deactivated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Stripe Product Deactivation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search for products based on query
exports.searchProducts = async (req, res) => {
  try {
    const { query, limit = 10, page = 1 } = req.query;

    const products = await stripe.products.search({
      query,
      limit,
      page,
    });

    res.status(200).json({ success: true, products: products.data });
  } catch (error) {
    console.error('Stripe Product Search Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.Subscribe = async (req, res) => {
  const price_id = req.query.price_id;
  const user_id = req.query.user_id;
  const promo_code = req.query.promo_code;

  try {
    // Fetch the user's email
    let user = await User.findOne({ where: { user_id: user_id } });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const userEmail = user.email;

    // Fetch the price details from Stripe
    const price = await stripe.prices.retrieve(price_id);

    // Ensure the price is for a recurring subscription
    if (!price.recurring) {
      return res.status(400).send('The provided price ID does not correspond to a subscription.');
    }

    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const existingCustomers = await stripe.customers.list({ email: user.email });
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        user.stripe_customer_id = stripeCustomerId;
        await user.save();
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
        });
        stripeCustomerId = newCustomer.id;
        user.stripe_customer_id = stripeCustomerId;
        await user.save();
      }
    }

    // Fetch the customer's payment methods
    // const paymentMethods = await stripe.paymentMethods.list({
    //   type: 'card',
    //   limit: 3,
    //   customer: user.stripe_customer_id,
    // });
    // console.log("paymentMethods",paymentMethods)
    const sessionParams = {
      mode: 'subscription',
      success_url: `${process.env.BASE_URL}/api/stripe-payment-subscriptions/success-subscription?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(userEmail)}&user_id=${user_id}`,
      cancel_url: `${process.env.FRONTEND_URL}/user/subscription`,
      line_items: [
        {
          price: price_id,  // Use the price ID directly here
          quantity: 1,
        },
      ],
      customer: stripeCustomerId,
      allow_promotion_codes: true,
      // payment_method_types: ['card'], // Add this line

      payment_method_data: {
        allow_redisplay: 'always',
        // Optional: You can pre-select a payment method if needed
        // payment_method: paymentMethods.data[0]?.id, // Uncomment to pre-select the first payment method
      },
      promotion_code: promo_code,  // Pass the promo code here if available
      // metadata: {
      //   course_id: req.query.course_id, // Include course_id in metadata
      //   course_name: course_name, // Include course_name in metadata
      // },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.redirect(session.url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('Internal Server Error');
  }
};
exports.SuccessSubscribe = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ['subscription', 'subscription.plan.product'],
    });
    const subscription = session.subscription;
    const subscriptionId = subscription.id;
    const stripePriceId = subscription.plan.id;
    const planId = subscription.plan.product.id;
    const currentPeriodStart = subscription.start_date;
    // const currentPeriodEnd = subscription.current_period_end;

    const startDate = new Date(currentPeriodStart * 1000);
    // const endDate = new Date(currentPeriodEnd * 1000);
    const billingCycleAnchor = subscription.billing_cycle_anchor;
    const trialEnd = subscription.trial_end;
    const items = subscription.items.data;
    const status = subscription.status;

    const now = new Date();
    let endDate = new Date(startDate);

    if (subscription.plan.interval === 'day') {
      endDate.setDate(endDate.getDate() + subscription.plan.interval_count);
    } else if (subscription.plan.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + subscription.plan.interval_count);
    } else if (subscription.plan.interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + subscription.plan.interval_count);
    }


    // Save to subscription_histories (always create new)
    await StripeSubscriptionHistoriesModel.create({
      user_id: req.query.user_id,
      stripe_subscription_id: subscriptionId,
      price_id: stripePriceId,
      plan_id: planId,
      status,
      start_date: startDate,
      end_date: endDate, // ✅ Add this line
      billing_cycle_anchor: new Date(billingCycleAnchor * 1000),
      trial_end: trialEnd ? new Date(trialEnd * 1000) : null,
      items,
      created_at: now,
      updated_at: now,
    });
    

    // Check if subscription with same user_id + price_id + plan_id exists
    const existing = await StripePaidSubscriptionModel.findOne({
      where: {
        user_id: req.query.user_id,
        price_id: stripePriceId,
        plan_id: planId,
      },
    });

    const subscriptionData = {
      stripe_subscription_id: subscriptionId,
      status,
      start_date: startDate,
      end_date: endDate, // ✅ Add this line
      billing_cycle_anchor: new Date(billingCycleAnchor * 1000),
      trial_end: trialEnd ? new Date(trialEnd * 1000) : null,
      items,
      updated_at: now,
    };
    

    if (existing) {
      await existing.update(subscriptionData);
    } else {
      await StripePaidSubscriptionModel.create({
        user_id: req.query.user_id,
        price_id: stripePriceId,
        plan_id: planId,
        created_at: now,
        ...subscriptionData,
      });
    }

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/user/subscription`);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).send('Internal Server Error');
  }
};


exports.FailedSubscribe = async (req, res) => {
  res.redirect('/')
}

exports.AdminSubscriptionHistory = async (req, res) => {
  try {
    const { price_id, user_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!price_id || !user_id) {
      return res.status(400).json({ message: "Missing required query parameters: price_id and/or user_id" });
    }

    const { count, rows } = await StripeSubscriptionHistoriesModel.findAndCountAll({
      where: {
        price_id,
        user_id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      total: count,
      page,
      limit: limit,
      records: rows
    });
  } catch (error) {
    console.error("Error in AdminSubscriptionHistory:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.AdminSubscriptionList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereUser = search
      ? {
          [Op.or]: [
            { email: { [Op.like]: `%${search}%` } },
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await StripePaidSubscriptionModel.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          where: whereUser,
          attributes: ['user_id', 'email', 'firstName', 'lastName'],
          required: true, // Ensures only subscriptions with matching users are returned
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return res.json({
      total: count,
      page,
      limit: limit,
      subscriptions: rows,
    });
  } catch (error) {
    console.error('Error in AdminSubscriptionList:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.UserSubscriptionList = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const offset = (page - 1) * limit;

    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id in query parameters" });
    }

    const { count, rows } = await StripePaidSubscriptionModel.findAndCountAll({
      where: { user_id: user_id },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return res.json({
      total: count,
      page,
      limit: limit,
      subscriptions: rows,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};