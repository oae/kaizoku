import {
  EuiButton,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiIcon,
  EuiPageSidebar,
  EuiPageTemplate,
  EuiTitle,
} from '@elastic/eui';
import { BiBookContent } from 'react-icons/bi';
import { FcSettings } from 'react-icons/fc';

export default function IndexPage() {
  return (
    <EuiPageTemplate panelled grow>
      <EuiPageSidebar sticky>Sidebar</EuiPageSidebar>
      <EuiHeader>
        <EuiHeaderSection grow={false}>
          <EuiHeaderSectionItem border="right">
            <EuiIcon type={BiBookContent} color="red" size="xl" />
            <EuiTitle className="ml-1">
              <span>Kaizoku</span>
            </EuiTitle>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>

        <EuiHeaderSection side="right">
          <EuiHeaderSectionItem border="right" className="mr-1">
            <EuiButtonIcon iconType={FcSettings} iconSize="l" size="m" />
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
      </EuiHeader>
      <EuiEmptyPrompt
        icon={<EuiIcon type={BiBookContent} size="xxl" />}
        title={<h2>No library found</h2>}
        body={<p>To be able to add new manga, you need to create a library</p>}
        actions={
          <EuiButton color="primary" fill>
            Create a Library
          </EuiButton>
        }
      />
    </EuiPageTemplate>
  );
}
