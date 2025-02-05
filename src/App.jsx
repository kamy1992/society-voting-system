import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@src/components/ui/card';
import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Alert, AlertDescription } from '@src/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/components/ui/tabs';

const VotingApp = () => {
  const [positions] = useState([
    'Society President',
    'Secretary',
    'Treasurer'
  ]);

  const [candidates, setCandidates] = useState([
    { id: 1, name: 'John Doe', position: 'Society President', votes: 0 },
    { id: 2, name: 'Jane Smith', position: 'Society President', votes: 0 },
    { id: 3, name: 'Mike Johnson', position: 'Secretary', votes: 0 },
    { id: 4, name: 'Sarah Wilson', position: 'Secretary', votes: 0 },
    { id: 5, name: 'Robert Brown', position: 'Treasurer', votes: 0 }
  ]);

  const [voters, setVoters] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newCandidate, setNewCandidate] = useState({ name: '', position: 'Society President' });
  const [voterRegistration, setVoterRegistration] = useState({ email: '', apartmentNo: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [votedCategories, setVotedCategories] = useState(new Set());

  const handleAdminLogin = () => {
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin') {
      setIsAdmin(true);
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleRegisterVoter = () => {
    if (!voterRegistration.email || !voterRegistration.apartmentNo) {
      setError('Please fill in all fields');
      return;
    }
    
    if (voters.find(v => v.email === voterRegistration.email)) {
      setError('This email is already registered');
      return;
    }

    // Check if apartment has already cast 2 votes
    const existingVotesFromApartment = voters.filter(v => 
      v.apartmentNo === voterRegistration.apartmentNo
    ).length;

    if (existingVotesFromApartment >= 2) {
      setError('Maximum 2 voters allowed per apartment');
      return;
    }

    setVoters([...voters, { ...voterRegistration, votedPositions: [] }]);
    setVoterRegistration({ email: '', apartmentNo: '' });
    setSuccess('Voter registered successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddCandidate = () => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }

    if (!newCandidate.name) {
      setError('Please enter candidate name');
      return;
    }

    setCandidates([
      ...candidates,
      {
        id: candidates.length + 1,
        ...newCandidate,
        votes: 0
      }
    ]);
    setNewCandidate({ name: '', position: 'Society President' });
    setSuccess('Candidate added successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLogin = () => {
    const voter = voters.find(v => v.email === voterRegistration.email);
    if (!voter) {
      setError('Voter not found. Please register first.');
      return;
    }
    setCurrentUser(voter);
    setVotedCategories(new Set(voter.votedPositions || []));
    setError('');
  };

  const handleVote = (candidateId) => {
    if (!currentUser) {
      setError('Please login first');
      return;
    }

    const candidate = candidates.find(c => c.id === candidateId);
    
    if (votedCategories.has(candidate.position)) {
      setError(`You have already voted for ${candidate.position}`);
      return;
    }

    // Update candidates
    setCandidates(candidates.map(c => 
      c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
    ));

    // Update voter's voted positions
    const updatedVotedCategories = new Set(votedCategories);
    updatedVotedCategories.add(candidate.position);
    setVotedCategories(updatedVotedCategories);

    // Update voters list
    setVoters(voters.map(v =>
      v.email === currentUser.email 
        ? { ...v, votedPositions: [...(v.votedPositions || []), candidate.position] }
        : v
    ));

    setSuccess(`Vote cast successfully for ${candidate.position}!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const isPositionVoted = (position) => votedCategories.has(position);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Society Voting System</h1>

      <Tabs defaultValue="register">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="vote">Vote</TabsTrigger>
          <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Registration Tab */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Voter Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Email"
                value={voterRegistration.email}
                onChange={(e) => setVoterRegistration({
                  ...voterRegistration,
                  email: e.target.value
                })}
              />
              <Input
                placeholder="Apartment Number"
                value={voterRegistration.apartmentNo}
                onChange={(e) => setVoterRegistration({
                  ...voterRegistration,
                  apartmentNo: e.target.value
                })}
              />
              <Button onClick={handleRegisterVoter}>Register</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voting Tab */}
        <TabsContent value="vote">
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!currentUser ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter registered email"
                    value={voterRegistration.email}
                    onChange={(e) => setVoterRegistration({
                      ...voterRegistration,
                      email: e.target.value
                    })}
                  />
                  <Button onClick={handleLogin}>Login</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map(position => (
                    <div key={position} className="space-y-2">
                      <h3 className="font-medium">{position}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {candidates
                          .filter(c => c.position === position)
                          .map(candidate => (
                            <Button
                              key={candidate.id}
                              onClick={() => handleVote(candidate.id)}
                              disabled={isPositionVoted(position)}
                              variant={isPositionVoted(position) ? "secondary" : "default"}
                            >
                              {candidate.name}
                            </Button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Candidates Tab */}
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAdmin ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Admin Username"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({
                      ...adminCredentials,
                      username: e.target.value
                    })}
                  />
                  <Input
                    type="password"
                    placeholder="Admin Password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({
                      ...adminCredentials,
                      password: e.target.value
                    })}
                  />
                  <Button onClick={handleAdminLogin}>Login</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    placeholder="Candidate Name"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({
                      ...newCandidate,
                      name: e.target.value
                    })}
                  />
                  <select
                    className="w-full p-2 border rounded"
                    value={newCandidate.position}
                    onChange={(e) => setNewCandidate({
                      ...newCandidate,
                      position: e.target.value
                    })}
                  >
                    {positions.map(position => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAddCandidate}>Add Candidate</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Election Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!isAdmin ? (
                <div className="space-y-4">
                  <p>Admin access required to view results</p>
                  <Input
                    type="text"
                    placeholder="Admin Username"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({
                      ...adminCredentials,
                      username: e.target.value
                    })}
                  />
                  <Input
                    type="password"
                    placeholder="Admin Password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({
                      ...adminCredentials,
                      password: e.target.value
                    })}
                  />
                  <Button onClick={handleAdminLogin}>Login</Button>
                </div>
              ) : (
                positions.map(position => (
                  <div key={position} className="mb-6">
                    <h3 className="font-medium mb-2">{position}</h3>
                    {candidates
                      .filter(c => c.position === position)
                      .sort((a, b) => b.votes - a.votes)
                      .map(candidate => (
                        <div key={candidate.id} className="flex justify-between items-center mb-2">
                          <span>{candidate.name}</span>
                          <span className="font-medium">{candidate.votes} votes</span>
                        </div>
                      ))}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VotingApp;
