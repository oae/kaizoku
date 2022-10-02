import { EuiPageTemplate } from '@elastic/eui';

export default function IndexPage() {
  return (
    <EuiPageTemplate panelled grow>
      <EuiPageTemplate.Sidebar sticky>Sidebar</EuiPageTemplate.Sidebar>
      <EuiPageTemplate.Header title="Kaizoku" />
      <EuiPageTemplate.EmptyPrompt title={<span>No spice</span>} footer={<span>Footer</span>}>
        Empty
      </EuiPageTemplate.EmptyPrompt>
    </EuiPageTemplate>
  );
}
