import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getUserData } from '../services/authService';
import { getPairData, getPartnerData } from '../services/pairingService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [pairData, setPairData] = useState(null);
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const data = await getUserData(firebaseUser.uid);
          setUserData(data);

          if (data?.pairId) {
            const pair = await getPairData(data.pairId);
            setPairData(pair);
            const partner = await getPartnerData(pair, firebaseUser.uid);
            setPartnerData(partner);
          } else {
            setPairData(null);
            setPartnerData(null);
          }
        } catch (err) {
          console.error('Error loading user data:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
        setPairData(null);
        setPartnerData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const data = await getUserData(user.uid);
      setUserData(data);
      if (data?.pairId) {
        const pair = await getPairData(data.pairId);
        setPairData(pair);
        const partner = await getPartnerData(pair, user.uid);
        setPartnerData(partner);
      } else {
        setPairData(null);
        setPartnerData(null);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const value = {
    user,
    userData,
    pairData,
    partnerData,
    loading,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
