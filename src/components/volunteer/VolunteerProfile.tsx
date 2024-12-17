import { Volunteer } from '../../types/volunteer';
import ProfileHeader from './profile/ProfileHeader';
import ContactInfo from './profile/ContactInfo';
import SkillsLanguages from './profile/SkillsLanguages';
import AvailabilityInfo from './profile/AvailabilityInfo';
import { canEditSettings } from '../../utils/volunteerUtils';

interface VolunteerProfileProps {
  volunteer: Volunteer;
}

const VolunteerProfile: React.FC<VolunteerProfileProps> = ({ volunteer }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ProfileHeader volunteer={volunteer} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactInfo volunteer={volunteer} />
        
        <div className="space-y-6">
          <SkillsLanguages volunteer={volunteer} />
          <AvailabilityInfo availability={volunteer.availability} />
        </div>
      </div>

      {canEditSettings(volunteer.role) && (
        <div className="mt-6 flex justify-end">
          <button className="text-rose-600 hover:text-rose-700 font-medium">
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default VolunteerProfile;