import react from 'react';
import { useLocation } from "react-router-dom";
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
// fghfth
const Invite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const { data: user, error } = supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (error) {
    console.error("Error fetching invitation:", error);
    return <p>Error fetching invitation</p>;
  }

  if (!user) {
    return <p>No invitation found</p>;
  }

  const { data: checkuser, error: checkError } = supabase
    .from('organization_members')
    .select('*')
    .eq('id', (
      supabase
        .from('users')
        .select('id')
        .eq('email', user.invited_email)
    ))
  if (checkuser) {
    return <p>User already exists in the organization</p>;
  }
  if (checkError) {
    console.error("Error checking user:", checkError);
    return <p>Error checking user</p>;
  }

  const { data: userData, error: userError } = supabase
    .from('users')
    .select('*')
    .eq('email', user.invited_email)
    .single();

  if (userError) {
    console.error("Error fetching user:", userError);
    return <p>Error fetching user</p>;
  }

  if (userData) {
    const { data: orgdata, error: orgError } = supabase
      .from('organization_members')
      .insert({
        user_id: userData.id,
        organization_id: user.organization_id,
        role: 'member'
      });

    if (orgError) {
      console.error("Error adding user to organization:", orgError);
      return <p>Error adding user to organization</p>;
    }
    navigate('/dashboard');
  }

  return (
    <div>
      <h1>Invitation Details</h1>
      <p>Email: {user.invited_email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
};

export default Invite;