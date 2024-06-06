import { Button } from '../ui/button';

interface SampleButtonVariantsProps {}
const SampleButtonVariants: React.FC<SampleButtonVariantsProps> = ({}) => {
  return (
    <div>
      <div className="flex gap-2">
        <Button variant="default">default</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="link">link</Button>
        <Button variant="outline">outline</Button>
        <Button variant="secondary">secondary</Button>
      </div>
    </div>
  );
};
export default SampleButtonVariants;
