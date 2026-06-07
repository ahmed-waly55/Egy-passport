export interface ILogin {
 emailOrMobile: string,
  password: string
}


export interface ISignup {
  fullName: string,
  email: string,
  mobileNumber: string,
  password: string,
  confirmPassword: string,
  termsAccepted: boolean

}
export interface IForgotPassword {
  emailOrMobile: string
}
