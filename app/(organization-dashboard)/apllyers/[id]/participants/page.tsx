import MissionParticipantsManager from "../../MissionParticipantsManager";

export default function MissionParticipantsPage({ params }: { params: { id: string } }) {
  return <MissionParticipantsManager missionId={params.id} />;
}