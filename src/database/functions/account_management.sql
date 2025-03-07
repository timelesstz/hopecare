-- Function to deactivate an account
CREATE OR REPLACE FUNCTION deactivate_account(
  user_id UUID,
  deactivation_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user status
  UPDATE users
  SET 
    status = 'INACTIVE',
    updated_at = CURRENT_TIMESTAMP,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{deactivation}',
      jsonb_build_object(
        'reason', deactivation_reason,
        'date', CURRENT_TIMESTAMP
      )
    )
  WHERE id = user_id;

  -- Revoke all active sessions
  DELETE FROM user_sessions
  WHERE user_id = user_id;

  -- Log the deactivation
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    user_id,
    'account_deactivated',
    'user',
    user_id,
    jsonb_build_object(
      'reason', deactivation_reason,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
END;
$$;

-- Function to initiate account deletion
CREATE OR REPLACE FUNCTION initiate_account_deletion(
  user_id UUID,
  deletion_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user status and schedule deletion
  UPDATE users
  SET 
    status = 'PENDING_DELETION',
    deletion_scheduled = CURRENT_TIMESTAMP + INTERVAL '30 days',
    updated_at = CURRENT_TIMESTAMP,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{deletion}',
      jsonb_build_object(
        'reason', deletion_reason,
        'initiated_at', CURRENT_TIMESTAMP,
        'scheduled_for', CURRENT_TIMESTAMP + INTERVAL '30 days'
      )
    )
  WHERE id = user_id;

  -- Revoke all active sessions
  DELETE FROM user_sessions
  WHERE user_id = user_id;

  -- Log the deletion initiation
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    user_id,
    'account_deletion_initiated',
    'user',
    user_id,
    jsonb_build_object(
      'reason', deletion_reason,
      'scheduled_deletion', CURRENT_TIMESTAMP + INTERVAL '30 days'
    )
  );
END;
$$;

-- Function to permanently delete account and related data
CREATE OR REPLACE FUNCTION permanently_delete_account(
  user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log final deletion
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    user_id,
    'account_permanently_deleted',
    'user',
    user_id,
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'deletion_type', 'permanent'
    )
  );

  -- Delete related data
  DELETE FROM user_profiles WHERE user_id = user_id;
  DELETE FROM donor_profiles WHERE user_id = user_id;
  DELETE FROM volunteer_profiles WHERE user_id = user_id;
  DELETE FROM user_sessions WHERE user_id = user_id;
  DELETE FROM email_verification_tokens WHERE user_id = user_id;
  DELETE FROM password_reset_tokens WHERE user_id = user_id;
  
  -- Finally, delete the user
  DELETE FROM users WHERE id = user_id;
END;
$$;

-- Function to get accounts pending deletion
CREATE OR REPLACE FUNCTION get_accounts_pending_deletion()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  deletion_scheduled TIMESTAMP WITH TIME ZONE,
  deletion_reason TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id as user_id,
    email,
    deletion_scheduled,
    metadata->'deletion'->>'reason' as deletion_reason
  FROM users
  WHERE 
    status = 'PENDING_DELETION'
    AND deletion_scheduled <= CURRENT_TIMESTAMP;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at <= CURRENT_TIMESTAMP
  RETURNING COUNT(*) INTO deleted_count;

  RETURN deleted_count;
END;
$$;

-- Function to get user activity history
CREATE OR REPLACE FUNCTION get_user_activity_history(
  target_user_id UUID,
  from_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  to_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  activity_id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id as activity_id,
    action,
    entity_type,
    entity_id,
    metadata,
    created_at
  FROM activity_logs
  WHERE 
    user_id = target_user_id
    AND (from_date IS NULL OR created_at >= from_date)
    AND (to_date IS NULL OR created_at <= to_date)
  ORDER BY created_at DESC;
$$; 