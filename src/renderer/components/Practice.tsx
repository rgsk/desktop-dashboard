import { useEffect } from 'react';
import { Button } from 'src/renderer/components/ui/button';
import SampleButtonVariants from './Samples/SampleButtonVariants';

interface PracticeProps {}
const Practice: React.FC<PracticeProps> = ({}) => {
  useEffect(() => {}, []);
  return (
    <div>
      <p className="text-3xl text-green-500">Practice Changed again</p>
      <div>
        <ButtonDemo />
      </div>
      <div className="mt-[100px]">
        <SampleButtonVariants></SampleButtonVariants>
      </div>
    </div>
  );
};
export default Practice;

export function ButtonDemo() {
  return <Button>Button 123</Button>;
}
