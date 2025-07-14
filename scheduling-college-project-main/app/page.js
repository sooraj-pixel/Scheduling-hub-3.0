"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const Login = () => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false)
  // const [email, setEmail] = useState('admin@gmail.com' || "")
  // const [password, setPassword] = useState('0000' || "")
  const [email, setEmail] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [password, setPassword] = useState("")

  const verifyUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json();

      if (!response.ok) {
        return alert("Incorrect details. Try again!")
      }
      localStorage.setItem('user', JSON.stringify(data));
      // console.log(data);
      router.push('/dashboard')
    }
    catch (err) {
      console.log(err);
    }
  }
  const handlePasswordRequest = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/users/changePassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetEmail }),
    });
    // const result = await res.json();
    // console.log(result, res);

    if (res.ok) {
      setShowForm(false)
      alert("Request submitted. Admin will reset your password.");
      setResetEmail("");
    }
    else {
      alert("There was some error in submitting the request.");
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* image */}
      <div className="h-screen relative w-1/2">
        <img className='object-cover w-full h-full blur-sm' src="homebg.jpeg" alt="" />
        <div className="w-full absolute top-0 left-0 h-full bg-n-6/20" />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center  text-white px-5 py-3 text-5xl font-semibold  rounded-md'>
          NCT Scheduling Hub
        </div>
      </div>

      {/* Login form */}
      <div className={`${showForm ? 'hidden' : 'flex-center'} mx-auto w-1/3 drop-shadow-lg m-10`}>
        <div className="bg-n-1 w-full px-5 py-10 rounded-lg ">
          <div>
            <img alt="NCT Logo" src="./nctLogo-black.png" width={220} className='m-auto' />
            <h2 className="h1 text-center my-7">
              Log in
            </h2>
          </div>
          <form noValidate onSubmit={e => verifyUser(e)}>
            <div>
              <label htmlFor="email" className="block font-medium text-gray-900">
                Email address
              </label>
              <div className="">
                <input id="email" name="email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className=""
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <input id="password" name="password" type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className=""
              />
              <div className="text-sm mt-1.5">
                <button type='button' onClick={e => setShowForm(true)} className="btn-link mt-2">
                  Forgot password?
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-5">
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal Form */}
      <div className={` ${showForm ? 'flex-center' : 'hidden'} flex-col mx-auto w-1/3 bg-white drop-shadow-lg m-10 px-10`}>
        <h2 className="h2 mb-5">Forgot Password</h2>

        <form onSubmit={e => handlePasswordRequest(e)}>
          <p className='text-gray-700'>An email will be sent to the admin for the following email to reset the password.</p>
          <div className="mb-4">
            <label>Email</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-4">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
