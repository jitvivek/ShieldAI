import auth from '@react-native-firebase/auth';

interface AuthUser {
  uid: string;
  phone: string;
  isNewUser: boolean;
}

class FirebaseAuth {
  async sendOtp(phoneNumber: string): Promise<any> {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  }

  async verifyOtp(confirmation: any, code: string): Promise<AuthUser> {
    const result = await confirmation.confirm(code);
    const user = result.user;
    const isNew = result.additionalUserInfo?.isNewUser ?? false;

    return {
      uid: user.uid,
      phone: user.phoneNumber ?? '',
      isNewUser: isNew,
    };
  }

  async getCurrentUser() {
    return auth().currentUser;
  }

  async getIdToken(): Promise<string | null> {
    const user = auth().currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  async signOut(): Promise<void> {
    await auth().signOut();
  }
}

export const firebaseAuth = new FirebaseAuth();
