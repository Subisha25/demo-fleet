import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

export interface PublicContactInfo {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
}

export const DEFAULT_PUBLIC_CONTACT: PublicContactInfo = {
  phone: '+91 98417 22675',
  email: 'support@fleetflow.com',
  address: 'Chennai, Tamil Nadu, India',
  businessHours: '24/7 Dispatch Operations',
};

let cachedContactInfo: PublicContactInfo | null = null;
let pendingFetch: Promise<PublicContactInfo> | null = null;

export const fetchPublicContactInfo = async (): Promise<PublicContactInfo> => {
  if (cachedContactInfo) {
    return cachedContactInfo;
  }

  if (pendingFetch) {
    return pendingFetch;
  }

  const BASE_URL = config.baseurl.apibaseurl;

  pendingFetch = (async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/public/contact-info`, {
        timeout: 4000,
      });
      if (res.data && res.data.success && res.data.contact) {
        cachedContactInfo = {
          phone: res.data.contact.phone || DEFAULT_PUBLIC_CONTACT.phone,
          email: res.data.contact.email || DEFAULT_PUBLIC_CONTACT.email,
          address: res.data.contact.address || DEFAULT_PUBLIC_CONTACT.address,
          businessHours: res.data.contact.businessHours || DEFAULT_PUBLIC_CONTACT.businessHours,
        };
        return cachedContactInfo;
      }
    } catch {
      // Safe fallback on any network error or timeout
    }
    cachedContactInfo = DEFAULT_PUBLIC_CONTACT;
    return cachedContactInfo;
  })();

  return pendingFetch;
};

export const usePublicContact = () => {
  const [contact, setContact] = useState<PublicContactInfo>(cachedContactInfo || DEFAULT_PUBLIC_CONTACT);
  const [loading, setLoading] = useState<boolean>(!cachedContactInfo);

  useEffect(() => {
    let isMounted = true;
    fetchPublicContactInfo().then((data) => {
      if (isMounted) {
        setContact(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return { contact, loading };
};
