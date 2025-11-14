import { getServiceRoleClient } from './supabase';

export const supabaseDb = getServiceRoleClient();

export const db = {
  campaign: {
    findMany: async (options?: { where?: any; include?: any; orderBy?: any }) => {
      let query = supabaseDb.from('campaigns').select(`
        *,
        startup_profiles (
          *,
          users (
            name,
            email
          ),
          startup_metrics (
            *
          )
        ),
        investments (count)
      `);

      if (options?.where?.status) {
        query = query.eq('status', options.where.status);
      }

      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' });
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return data?.map((campaign: any) => ({
        ...campaign,
        startupProfile: campaign.startup_profiles ? {
          ...campaign.startup_profiles,
          user: campaign.startup_profiles.users,
          metrics: campaign.startup_profiles.startup_metrics?.slice(0, 1) || []
        } : null,
        _count: {
          investments: campaign.investments?.length || 0
        }
      })) || [];
    },

    findUnique: async (options: { where: { id: string }; include?: any }) => {
      let query = supabaseDb.from('campaigns').select(`
        *,
        startup_profiles (
          *,
          users (
            name,
            email
          )
        ),
        investments (*)
      `).eq('id', options.where.id).single();

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map the nested data back to expected format
      if (data) {
        return {
          ...data,
          startupProfile: data.startup_profiles ? {
            ...data.startup_profiles,
            user: data.startup_profiles.users
          } : null
        };
      }
      return data;
    },

    create: async (options: { data: any }) => {
      const { data, error } = await supabaseDb
        .from('campaigns')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (options: { where: { id: string }; data: any }) => {
      const { data, error } = await supabaseDb
        .from('campaigns')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (options: { where: { id: string } }) => {
      const { data, error } = await supabaseDb
        .from('campaigns')
        .delete()
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  startupProfile: {
    findUnique: async (options: { where: { userId?: string; id?: string }; include?: any }) => {
      let query = supabaseDb.from('startup_profiles').select(`
        *,
        ${options.include?.campaigns ? 'campaigns (*)' : ''}
      `);
      
      if (options.where.userId) {
        query = query.eq('userId', options.where.userId);
      } else if (options.where.id) {
        query = query.eq('id', options.where.id);
      }

      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (options: { data: any }) => {
      const { data, error } = await supabaseDb
        .from('startup_profiles')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (options: { where: { id: string }; data: any }) => {
      const { data, error } = await supabaseDb
        .from('startup_profiles')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  investorProfile: {
    findUnique: async (options: { where: { userId?: string; id?: string }; include?: any }) => {
      let query = supabaseDb.from('investor_profiles').select('*');
      
      if (options.where.userId) {
        query = query.eq('userId', options.where.userId);
      } else if (options.where.id) {
        query = query.eq('id', options.where.id);
      }

      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (options: { data: any }) => {
      const { data, error } = await supabaseDb
        .from('investor_profiles')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (options: { where: { id: string }; data: any }) => {
      const { data, error } = await supabaseDb
        .from('investor_profiles')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  investment: {
    findMany: async (options?: { where?: any; include?: any; orderBy?: any }) => {
      let query = supabaseDb.from('investments').select(`
        *,
        campaigns (
          *,
          startup_profiles (
            *,
            users (name)
          )
        ),
        investor_profiles (
          *,
          users (name, email)
        )
      `);

      if (options?.where?.investorProfileId) {
        query = query.eq('investorProfileId', options.where.investorProfileId);
      }

      if (options?.where?.campaignId) {
        if (options.where.campaignId.in) {
          query = query.in('campaignId', options.where.campaignId.in);
        } else {
          query = query.eq('campaignId', options.where.campaignId);
        }
      }

      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map the nested data back to expected format
      return data?.map((investment: any) => ({
        ...investment,
        campaign: investment.campaigns ? {
          ...investment.campaigns,
          startupProfile: investment.campaigns.startup_profiles ? {
            ...investment.campaigns.startup_profiles,
            user: investment.campaigns.startup_profiles.users
          } : null
        } : null,
        investorProfile: investment.investor_profiles ? {
          ...investment.investor_profiles,
          user: investment.investor_profiles.users
        } : null
      })) || [];
    },

    create: async (options: { data: any }) => {
      const { data, error } = await supabaseDb
        .from('investments')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (options: { where: { id: string }; data: any }) => {
      const { data, error } = await supabaseDb
        .from('investments')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    findUnique: async (options: { where: { id: string }; include?: any }) => {
      const { data, error } = await supabaseDb
        .from('investments')
        .select('*')
        .eq('id', options.where.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  user: {
    findUnique: async (options: { where: { email?: string; id?: string }; include?: any }) => {
      let query = supabaseDb.from('users').select('*');
      
      if (options.where.email) {
        query = query.eq('email', options.where.email);
      } else if (options.where.id) {
        query = query.eq('id', options.where.id);
      }

      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (options: { data: any }) => {
      const { data, error } = await supabaseDb
        .from('users')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (options: { where: { id: string }; data: any }) => {
      const { data, error } = await supabaseDb
        .from('users')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  metric: {
    findMany: async (options?: { where?: any; orderBy?: any; take?: number }) => {
      let query = supabaseDb.from('startup_metrics').select('*');

      if (options?.where?.startupProfileId) {
        query = query.eq('startupProfileId', options.where.startupProfileId);
      }

      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' });
      }

      if (options?.take) {
        query = query.limit(options.take);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },

    create: async (options: { data: any }) => {
      const { data, error } = await supabaseDb
        .from('startup_metrics')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  alert: {
    findMany: async (options?: { where?: any; orderBy?: any }) => {
      let query = supabaseDb.from('alerts').select('*');

      if (options?.where?.resolved !== undefined) {
        query = query.eq('resolved', options.where.resolved);
      }

      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },

    update: async (options: { where: { id: string }; data: any }) => {
      const { data, error } = await supabaseDb
        .from('alerts')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      if (error) throw error;
      return data;
    }
  },

  benchmark: {
    findMany: async (options?: { where?: any; orderBy?: any }) => {
      let query = supabaseDb.from('benchmarks').select('*');

      if (options?.where?.companyId) {
        query = query.eq('companyId', options.where.companyId);
      }

      if (options?.orderBy?.createdAt) {
        query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  }
};
