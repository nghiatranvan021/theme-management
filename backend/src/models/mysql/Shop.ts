import mysql from 'mysql2/promise';
import {logger} from '../../utils/logger';
import { config } from '../../config/config';

const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: 'alireviews',  // Changed to match your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    logger.info('MySQL Database alireviews connected successfully');
    connection.release();
  })
  .catch(err => {
      logger.error('MySQL connection alireviews error:', err);
    process.exit(1); // Exit if we can't connect to database
  });

// Handle pool errors
pool.on("enqueue", () => {
  logger.error('Connection pool queue is full');
  process.exit(1);
});

export interface IShop extends mysql.RowDataPacket {
    shop_id: string;
    shop_name: string;
    domain: string;
    shop_email: string;
    name: string;
    shop_phone: string | null;
    shop_status: number;
    shop_country: string;
    shop_owner: string;
    app_version: string;
    init_app: number;
    billing_id: string;
    billing_interval: string;
    access_token: string;
    app_timezone: string;
    shop_timezone: string;
    affiliate_partner_id: string | null;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    plan_name: string;
    billing_on: Date;
    cancelled_on: Date | null;
    is_review_app: number;
    app_plan: string;
    pricing_version: number;
    trial_access_store: number;
    charge_now: number;
    theme_setting_version: number;
    code_invite: string | null;
    are_trial: number;
    trial_date: Date | null;
    currency: string;
    money_format: string;
    is_special: number;
    is_resource_feedback_added: number;
    business_type: string | null;
    business_solutions: string | null;
    already_traditional_setting: number;
    used_free: number;
    is_allow_topup_messent: number;
    skip_limit: number;
    plan_p4: string | null;
    is_charged: number;
    bfcm_group: string | null;
    bfcm_type: string | null;
    is_bfcm_converted: number;
    business_size: string | null;
    is_completed_obd: number;
    offer_free: number;
    connection_code: string | null;
    show_quickstart: number;
    partner_code: string | null;
    is_paused: number;
    paused_at: Date | null;
    is_new_trial: number;
    is_charge_first: number;
    is_remove_code: number;
    is_promo_used: number;
    is_promo_plan_changed: number;
    is_promo_uninstalled: number;
    is_uninstalled: number;
    is_reinstalling: number;
    segment_identified: number;
    is_new_widget: number;
    shopify_scope_version: number;
    trial_version: number;
    primary_locale: string;
    use_sale_boost_index: number;
    is_offer_one_usd: number;
    is_calculating_sbi: number;
}

interface FilterOptions {
  limit?: number;
  cursor?: string;
  query?: string;
  app_plan?: string;
  plan_name?: string;
}

export const findAll = async (options: FilterOptions = {}): Promise<{ shops: IShop[], nextCursor?: string }> => {
    try {
        const {
            limit = 10,
            cursor,
            query,
            app_plan,
            plan_name
        } = options;

        let whereConditions = [];
        let params = [];

        // Add cursor condition
        if (cursor) {
            whereConditions.push('created_at < ?');
            params.push(new Date(cursor));
        }

        // Add search query
        if (query) {
            whereConditions.push('(domain LIKE ? OR shop_name LIKE ?)');
            params.push(`%${query}%`, `%${query}%`);
        }

        // Add app plan filter
        if (app_plan) {
            whereConditions.push('app_plan = ?');
            params.push(app_plan);
        }

        // Add Shopify plan filter
        if (plan_name) {
            whereConditions.push('plan_name = ?');
            params.push(plan_name);
        }

        const whereClause = whereConditions.length 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        const query_str = `
            SELECT * FROM shop 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ?
        `;

        params.push(limit + 1);

        const [rows] = await pool.query<IShop[]>(query_str, params);

        // Get items for current page
        const hasMore = rows.length > limit;
        const shops = rows.slice(0, limit);
        
        // Get cursor for next page
        const nextCursor = hasMore ? shops[shops.length - 1].created_at.toISOString() : undefined;

        return { shops, nextCursor };
    } catch (error) {
        logger.error('Error in findAll shops:', error);
        throw error;
    }
};

export const findByShopId = async (shopId: number): Promise<IShop | null> => {
    try {
        const [rows] = await pool.query<IShop[]>(
            'SELECT * FROM shop WHERE shop_id = ?',
            [shopId]
        );
        return rows.length ? rows[0] : null;
    } catch (error) {
        logger.error('Error in findByShopId:', error);
        throw error;
    }
};

export const findByDomain = async (domain: string): Promise<IShop | null> => {
    try {
        const [rows] = await pool.query<IShop[]>(
            'SELECT * FROM shop WHERE domain = ?',
            [domain]
        );
        return rows.length ? rows[0] : null;
    } catch (error) {
        logger.error('Error in findByDomain:', error);
        throw error;
    }
};

export default {
    findAll,
    findByShopId,
    findByDomain,
};