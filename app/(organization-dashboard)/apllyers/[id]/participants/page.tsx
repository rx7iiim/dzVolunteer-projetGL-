import MissionParticipantsManager from "../../MissionParticipantsManager"; // Adjust path if you put component in components folder

interface PageProps {
  params: {
    id: string;
  };
}

export default function MissionParticipantsPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-slate-50/50">
      <MissionParticipantsManager missionId={params.id} />
    </main>
  );
}
