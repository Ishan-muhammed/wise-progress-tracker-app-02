import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubjects } from "@/hooks/useSubjects";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { useUserClasses } from "@/hooks/useUserClasses";
import LogoutButton from "@/components/LogoutButton";

interface Profile {
  name: string;
  email: string;
  gender: string | null;
  age: number | null;
}

const availableClasses = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

const ProfileSection = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const { subjects } = useSubjects();
  const { userSubjects, addSubject, removeSubject } = useUserSubjects();
  const { userClasses, addUserClass, removeUserClass } = useUserClasses();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, gender, age')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
        setFormData({
          name: data.name || "",
          gender: data.gender || "",
          age: data.age?.toString() || ""
        });
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setIsEditing(false);
      // Refresh profile data
      const { data } = await supabase
        .from('profiles')
        .select('name, email, gender, age')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
    setIsLoading(false);
  };

  const handleSubjectChange = async (subjectId: string, checked: boolean) => {
    if (checked) {
      const success = await addSubject(subjectId);
      if (success) {
        toast({
          title: "Subject Added",
          description: "Subject has been added to your profile"
        });
      }
    } else {
      const success = await removeSubject(subjectId);
      if (success) {
        toast({
          title: "Subject Removed",
          description: "Subject has been removed from your profile"
        });
      }
    }
  };

  const handleClassChange = async (className: string, checked: boolean) => {
    if (checked) {
      const success = await addUserClass(className);
      if (success) {
        toast({
          title: "Class Added",
          description: "Class has been added to your profile"
        });
      }
    } else {
      const success = await removeUserClass(className);
      if (success) {
        toast({
          title: "Class Removed",
          description: "Class has been removed from your profile"
        });
      }
    }
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  const userSubjectIds = userSubjects.map(us => us.subject_id);
  const userClassNames = userClasses.map(uc => uc.class);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="text-lg">{profile.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-lg">{profile.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Gender</Label>
                <p className="text-lg">{profile.gender || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Age</Label>
                <p className="text-lg">{profile.age || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Role(s)</Label>
                <p className="text-lg">{roles.join(", ")}</p>
              </div>
              <Button onClick={() => setIsEditing(true)} className="bg-[#039559]">
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder="Enter your name" />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={value => setFormData({
              ...formData,
              gender: value
            })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={formData.age} onChange={e => setFormData({
              ...formData,
              age: e.target.value
            })} placeholder="Enter your age" min="1" max="150" />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select the subjects you teach:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjects.map(subject => <div key={subject.id} className="flex items-center space-x-2">
                  <Checkbox id={subject.id} checked={userSubjectIds.includes(subject.id)} onCheckedChange={checked => handleSubjectChange(subject.id, checked as boolean)} />
                  <Label htmlFor={subject.id} className="text-sm font-normal">
                    {subject.name}
                  </Label>
                </div>)}
            </div>
            {userSubjects.length > 0 && <div className="mt-4">
                <Label className="text-sm font-medium text-gray-600">Your Teaching Subjects:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userSubjects.map(userSubject => <span key={userSubject.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {userSubject.subject_name}
                    </span>)}
                </div>
              </div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select the classes you teach:</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableClasses.map(className => (
                <div key={className} className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${className}`}
                    checked={userClassNames.includes(className)}
                    onCheckedChange={(checked) => handleClassChange(className, checked as boolean)}
                  />
                  <Label htmlFor={`class-${className}`} className="text-sm font-normal">
                    Class {className}
                  </Label>
                </div>
              ))}
            </div>
            {userClasses.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-600">Your Teaching Classes:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userClasses.map(userClass => (
                    <span key={userClass.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      Class {userClass.class}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              Sign out of your account to switch users or for security purposes.
            </p>
            <div className="flex justify-start">
              <LogoutButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
