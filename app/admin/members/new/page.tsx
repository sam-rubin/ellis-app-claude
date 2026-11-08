import MemberForm from "../MemberForm";
import { createMember } from "../../actions";

export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add member</h1>
      <MemberForm action={createMember} submitLabel="Add member" />
    </div>
  );
}
