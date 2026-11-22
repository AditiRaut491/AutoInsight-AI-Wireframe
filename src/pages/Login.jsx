import { useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark.jsx';

export default function Login() {
  const navigate = useNavigate();
  const signIn = (e) => { e.preventDefault(); navigate('/dashboard'); };
  return (
    <div className="login">
      <form className="card" onSubmit={signIn}>
        <div className="brand" style={{ padding: 0 }}><BrandMark />AutoInsight AI</div>
        <div>
          <h1 style={{ fontSize: 22 }}>Sign in</h1>
          <p className="sub">Explainable used-inventory intelligence</p>
        </div>
        <label className="f">Work email<input type="email" defaultValue="priya.s@lakesideauto.example" /></label>
        <label className="f">Password<input type="password" defaultValue="demo-password" /></label>
        <button className="btn pri" type="submit">Sign in</button>
        <button className="btn" type="button" onClick={signIn}>Sign in with dealer SSO</button>
        <p className="note">Wireframe: no real sign-in. Any input opens the demo.</p>
      </form>
    </div>
  );
}
