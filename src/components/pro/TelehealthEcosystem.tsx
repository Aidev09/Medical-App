import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Stethoscope, Video, Share2, Calendar, Camera, Syringe, 
  Star, Clock, MapPin, Globe, Languages, Shield, 
  FileText, AlertCircle, CheckCircle, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  nextAvailable: string;
  insuranceAccepted: boolean;
  languages: string[];
  image: string;
  education: string;
  experience: number;
  consultationFee: number;
  availability: {
    today: string[];
    tomorrow: string[];
  };
  specializations: string[];
  certifications: string[];
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: Date;
  time: string;
  type: 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const TelehealthEcosystem: React.FC = () => {
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('find');
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState<'video' | 'in-person'>('video');

  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Endocrinologist',
      rating: 4.8,
      distance: '1.2 mi',
      nextAvailable: 'Today 3:00 PM',
      insuranceAccepted: true,
      languages: ['English', 'Spanish'],
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      education: 'MD - Harvard Medical School',
      experience: 15,
      consultationFee: 150,
      availability: {
        today: ['3:00 PM', '4:00 PM', '5:00 PM'],
        tomorrow: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM']
      },
      specializations: ['Diabetes Management', 'Thyroid Disorders', 'Hormonal Imbalance'],
      certifications: ['American Board of Internal Medicine', 'Endocrinology Certification']
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      rating: 4.9,
      distance: '2.5 mi',
      nextAvailable: 'Tomorrow 10:00 AM',
      insuranceAccepted: true,
      languages: ['English', 'Mandarin'],
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      education: 'MD - Stanford University',
      experience: 20,
      consultationFee: 200,
      availability: {
        today: ['4:00 PM', '5:00 PM'],
        tomorrow: ['10:00 AM', '11:00 AM', '2:00 PM']
      },
      specializations: ['Cardiovascular Disease', 'Heart Failure', 'Preventive Cardiology'],
      certifications: ['American Board of Cardiology', 'Advanced Cardiac Life Support']
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Primary Care',
      rating: 4.7,
      distance: '0.8 mi',
      nextAvailable: 'Today 5:30 PM',
      insuranceAccepted: false,
      languages: ['English', 'Spanish'],
      image: 'https://randomuser.me/api/portraits/women/45.jpg',
      education: 'MD - Yale School of Medicine',
      experience: 10,
      consultationFee: 100,
      availability: {
        today: ['5:30 PM', '6:00 PM'],
        tomorrow: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM']
      },
      specializations: ['Preventive Medicine', 'Women\'s Health', 'Chronic Disease Management'],
      certifications: ['American Board of Family Medicine', 'Basic Life Support']
    }
  ]);

  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorId: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Endocrinologist',
      date: new Date('2024-01-25'),
      time: '3:00 PM',
      type: 'video',
      status: 'scheduled'
    },
    {
      id: '2',
      doctorId: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      date: new Date('2024-01-20'),
      time: '10:00 AM',
      type: 'in-person',
      status: 'completed',
      notes: 'Follow-up in 3 months'
    }
  ]);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetails(true);
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  const confirmBooking = () => {
    if (!selectedTime) {
      toast.error('Please select an appointment time');
      return;
    }

    toast.success('Appointment booked successfully');
    setShowBooking(false);
    setSelectedTime('');
  };

  const startVideoCall = (doctorName: string) => {
    toast.success(`Initiating secure video consultation with ${doctorName}`);
  };

  const shareRecords = (doctorId: string) => {
    toast.success('Medical records shared securely with end-to-end encryption');
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 4.0) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-full overflow-x-hidden">
      {/* Overview Card */}
      <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg flex-wrap">
            <Stethoscope className="h-5 w-5 text-teal-500 flex-shrink-0" />
            <span className="break-words">Telehealth Ecosystem</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Connect with top healthcare providers through secure video consultations and in-person visits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all min-h-[130px] flex flex-col items-center">
              <Video className="h-6 w-6 text-blue-500 mb-3" />
              <span className="text-sm font-medium mb-1 px-1">Video Consults</span>
              <p className="text-xs text-muted-foreground px-1">HD Secure Calls</p>
            </div>
            <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all min-h-[130px] flex flex-col items-center">
              <Share2 className="h-6 w-6 text-green-500 mb-3" />
              <span className="text-sm font-medium mb-1 px-1">Share Records</span>
              <p className="text-xs text-muted-foreground px-1">End-to-End Encrypted</p>
            </div>
            <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all min-h-[130px] flex flex-col items-center">
              <Calendar className="h-6 w-6 text-purple-500 mb-3" />
              <span className="text-sm font-medium mb-1 px-1">Easy Booking</span>
              <p className="text-xs text-muted-foreground px-1">Real-time Schedule</p>
            </div>
            <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all min-h-[130px] flex flex-col items-center">
              <Shield className="h-6 w-6 text-red-500 mb-3" />
              <span className="text-sm font-medium mb-1 px-1">HIPAA Compliant</span>
              <p className="text-xs text-muted-foreground px-1">Secure Platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="find" className="text-sm sm:text-base">Find Doctors</TabsTrigger>
          <TabsTrigger value="appointments" className="text-sm sm:text-base">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-4">
          {/* Search Section */}
      <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                  placeholder="Search by specialty, condition, or doctor name..."
              value={searchSpecialty}
              onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="pl-10 w-full text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Doctors List */}
          <div className="space-y-4">
            {doctors
              .filter(doc => 
                !searchSpecialty || 
                doc.specialty.toLowerCase().includes(searchSpecialty.toLowerCase()) ||
                doc.name.toLowerCase().includes(searchSpecialty.toLowerCase()) ||
                doc.specializations.some(s => s.toLowerCase().includes(searchSpecialty.toLowerCase()))
              )
              .map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="cursor-pointer w-full"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-teal-100 dark:border-teal-800 mx-auto sm:mx-0"
                        />
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-base sm:text-lg line-clamp-1">{doctor.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{doctor.specialty}</p>
                            </div>
                            <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                              {doctor.distance}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-y-2 text-sm mt-2">
                            <div className="flex items-center gap-1 min-w-0">
                              <Star className={`h-4 w-4 flex-shrink-0 ${getRatingColor(doctor.rating)}`} />
                              <span className="truncate">{doctor.rating}/5</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                              <Clock className="h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span className="truncate">{doctor.nextAvailable}</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                              <Globe className="h-4 w-4 flex-shrink-0 text-green-500" />
                              <span className="truncate">{doctor.languages.join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                              <Shield className="h-4 w-4 flex-shrink-0 text-purple-500" />
                              <span className="truncate">{doctor.insuranceAccepted ? 'Insurance Accepted' : 'Self Pay'}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {doctor.specializations.map((spec, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs max-w-full"
                              >
                                <span className="truncate">{spec}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium line-clamp-1">{appointment.doctorName}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{appointment.specialty}</p>
                    </div>
                    <Badge className={`${getStatusColor(appointment.status)} whitespace-nowrap flex-shrink-0`}>
                      {appointment.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-blue-500" />
                      <span className="truncate">{appointment.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span className="truncate">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-full sm:col-span-1 min-w-0">
                      {appointment.type === 'video' ? (
                        <Video className="h-4 w-4 flex-shrink-0 text-purple-500" />
                      ) : (
                        <MapPin className="h-4 w-4 flex-shrink-0 text-purple-500" />
                      )}
                      <span className="capitalize truncate">{appointment.type} Consultation</span>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-muted-foreground line-clamp-3">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.status === 'scheduled' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {appointment.type === 'video' && (
                    <Button 
                      size="sm" 
                          onClick={() => startVideoCall(appointment.doctorName)}
                          className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                    >
                          <Video className="h-4 w-4 mr-1 flex-shrink-0" />
                          Join Call
                    </Button>
                      )}
                    <Button 
                      size="sm"
                        variant="outline"
                        onClick={() => shareRecords(appointment.doctorId)}
                        className="w-full sm:w-auto"
                    >
                        <Share2 className="h-4 w-4 mr-1 flex-shrink-0" />
                        Share Records
                    </Button>
                  </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Doctor Details Dialog */}
      <Dialog open={showDoctorDetails} onOpenChange={setShowDoctorDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-1">{selectedDoctor.name}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-1">{selectedDoctor.specialty}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Experience & Education */}
                <div className="space-y-2">
                  <h3 className="font-medium">Experience & Education</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="min-w-0">
                      <Label className="text-muted-foreground">Experience</Label>
                      <p className="line-clamp-2">{selectedDoctor.experience} years</p>
                    </div>
                    <div className="min-w-0">
                      <Label className="text-muted-foreground">Education</Label>
                      <p className="line-clamp-2">{selectedDoctor.education}</p>
                    </div>
                  </div>
          </div>

                {/* Certifications */}
                <div className="space-y-2">
                  <h3 className="font-medium">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="max-w-full">
                        <span className="truncate">{cert}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <h3 className="font-medium">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="max-w-full">
                        <span className="truncate">{spec}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                      <h3 className="font-medium">Consultation Fee</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.insuranceAccepted ? 'Insurance Accepted' : 'Self Pay Only'}
                      </p>
                    </div>
                    <p className="text-lg font-bold">${selectedDoctor.consultationFee}</p>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="ghost" onClick={() => setShowDoctorDetails(false)} className="w-full sm:w-auto">
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowDoctorDetails(false);
                      handleBookAppointment(selectedDoctor);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Book Appointment
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Consultation Type</Label>
                  <Select
                    value={consultationType}
                    onValueChange={(value: 'video' | 'in-person') => setConsultationType(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Consultation</SelectItem>
                      <SelectItem value="in-person">In-Person Visit</SelectItem>
                    </SelectContent>
                  </Select>
                    </div>

                <div>
                  <Label>Select Date</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedDate === 'today' ? 'default' : 'outline'}
                      onClick={() => setSelectedDate('today')}
                      className="w-full"
                    >
                      Today
                    </Button>
                    <Button
                      variant={selectedDate === 'tomorrow' ? 'default' : 'outline'}
                      onClick={() => setSelectedDate('tomorrow')}
                      className="w-full"
                    >
                      Tomorrow
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {selectedDoctor.availability[selectedDate].map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(time)}
                        className="text-sm w-full"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
          </div>

                {consultationType === 'video' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">Video Consultation Requirements:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Stable internet connection</li>
                          <li>Quiet, well-lit environment</li>
                          <li>Working camera and microphone</li>
                        </ul>
                      </div>
                    </div>
            </div>
                )}

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="ghost" onClick={() => setShowBooking(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={confirmBooking} className="bg-green-500 hover:bg-green-600 w-full sm:w-auto">
                    Confirm Booking
                  </Button>
                </DialogFooter>
          </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TelehealthEcosystem;
