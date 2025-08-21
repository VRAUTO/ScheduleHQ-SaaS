import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const Invite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleInvite = async () => {
      try {
        // 1. Get invitation
        const { data: user, error: inviteError } = await supabase
          .from("invitations")
          .select("*")
          .eq("token", token)
          .eq("email", email)
          .eq("status", "pending")
          .single();

        if (inviteError || !user) {
          setError("Invitation not found");
          setLoading(false);
          return;
        }

        setInvitation(user);

        // 2. Check if user already exists in org
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.invited_email)
          .single();

        if (userError) {
          setError("Error fetching user");
          setLoading(false);
          return;
        }
        if (!existingUser) {
          // If user does not exist, redirect to signup
          navigate(`/inviteBySignup?token=${token}&email=${encodeURIComponent(user.invited_email)}`);
          return;
        }
        if (existingUser) {
          const { data: memberCheck, error: memberError } = await supabase
            .from("organization_members")
            .select("*")
            .eq("user_id", existingUser.id)
            .eq("org_id", user.organization_id)
            .maybeSingle();

          if (memberError) {
            setError("Error checking organization membership");
            setLoading(false);
            return;
          }

          if (memberCheck) {
            setError("User already exists in the organization");
            setLoading(false);
            return;
          }

          // 3. Add user to org
          const { error: insertError } = await supabase
            .from("organization_members")
            .insert({
              user_id: existingUser.id,
              org_id: user.organization_id,
              role: "member",
            });

          if (insertError) {
            setError("Error adding user to organization");
            setLoading(false);
            return;
          }

          navigate("/dashboard");
        }
      } catch (err) {
        setError("Unexpected error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      handleInvite();
    } else {
      navigate("/auth/callback");
      setError("No token provided");
      setLoading(false);
    }
  }, [token, navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Invitation Details</h1>
      <p>Email: {invitation?.invited_email}</p>
      <p>Role: {invitation?.role}</p>
    </div>
  );
};

export default Invite;
