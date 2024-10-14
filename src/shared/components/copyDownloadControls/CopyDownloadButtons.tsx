import * as React from 'react';
import { If } from 'react-if';
import { Button, ButtonGroup, Modal, FormControl } from 'react-bootstrap';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { ICopyDownloadInputsProps } from './ICopyDownloadControls';
import { getCustomButtonConfigs } from 'shared/components/CustomButton/CustomButtonServerConfig';
import { CustomButton } from '../CustomButton/CustomButton';

export interface ICopyDownloadButtonsProps extends ICopyDownloadInputsProps {
    copyButtonRef?: (el: HTMLButtonElement | null) => void;
    // displayResult?: string | null;
}
//
// async function sendToPythonScript(data: string) {
//     try {
//         const response = await fetch('http://localhost:3001/run-script', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ data }),
//         });
//         const result = await response.text();
//         console.log(result);
//     } catch (error) {
//         console.error('Error running script:', error);
//     }
// }

export class CopyDownloadButtons extends React.Component<
    ICopyDownloadButtonsProps,
    { showModal: boolean; galaxyToken: string; galaxyHistoryName: string }
> {
    public static defaultProps = {
        className: '',
        copyLabel: '',
        downloadLabel: '',
        showCopy: true,
        showDownload: true,
        showCopyMessage: false,
        showGalaxy: false,
    };

    constructor(props: ICopyDownloadButtonsProps) {
        super(props);
        this.state = {
            showModal: false,
            galaxyToken: '',
            galaxyHistoryName: '',
        };
    }

    get baseTooltipProps() {
        return {
            placement: 'top',
            mouseLeaveDelay: 0,
            mouseEnterDelay: 0.5,
        };
    }

    copyButton() {
        const button = (
            <button
                ref={this.props.copyButtonRef}
                className="btn btn-sm btn-default"
                data-clipboard-text="NA"
                id="copyButton"
                onClick={this.props.handleCopy}
            >
                {this.props.copyLabel} <i className="fa fa-clipboard" />
            </button>
        );

        // We need two separate tooltips to properly show/hide "Copied" text, and switch between "Copy" and "Copied".
        // (Also, we need to manually set the visibility due to async rendering issues after clicking the button)
        return (
            <DefaultTooltip
                overlay={<span className="alert-success">Copied!</span>}
                visible={this.props.showCopyMessage}
                {...this.baseTooltipProps}
                overlayClassName={this.props.className}
            >
                <DefaultTooltip
                    overlay={<span>Copy</span>}
                    visible={this.props.showCopyMessage ? false : undefined}
                    {...this.baseTooltipProps}
                    overlayClassName={this.props.className}
                >
                    {button}
                </DefaultTooltip>
            </DefaultTooltip>
        );
    }

    downloadButton() {
        return (
            <DefaultTooltip
                overlay={<span>Download TSV</span>}
                {...this.baseTooltipProps}
                overlayClassName={this.props.className}
            >
                <Button className="btn-sm" onClick={this.props.handleDownload}>
                    {this.props.downloadLabel}{' '}
                    <i className="fa fa-cloud-download" />
                </Button>
            </DefaultTooltip>
        );
    }

    handleGalaxyButtonClick = () => {
        this.setState({ showModal: true });
    };

    handleModalClose = () => {
        this.setState({ showModal: false });
    };

    handleOkClick = () => {
        const { galaxyToken, galaxyHistoryName } = this.state;
        this.props.handleDisplay?.(galaxyToken, galaxyHistoryName);
        this.setState({ showModal: false });
    };

    handleInputChange = (e: React.FormEvent<FormControl>) => {
        const target = e.target as HTMLInputElement;
        const { name, value } = target;
        this.setState({ [name]: value } as any);
    };

    galaxyButton() {
        return (
            <>
                <DefaultTooltip
                    overlay={<span>Export to Galaxy</span>}
                    {...this.baseTooltipProps}
                    overlayClassName={this.props.className}
                >
                    <Button
                        className="btn-sm"
                        onClick={this.handleGalaxyButtonClick}
                    >
                        Export data to Galaxy{' '}
                        <i className="fa fa-external-link" />
                    </Button>
                </DefaultTooltip>

                <Modal
                    show={this.state.showModal}
                    onHide={this.handleModalClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Enter Galaxy Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FormControl
                            type="text"
                            placeholder="Galaxy Token"
                            name="galaxyToken"
                            value={this.state.galaxyToken}
                            onChange={this.handleInputChange}
                        />
                        <FormControl
                            type="text"
                            placeholder="Galaxy History Name"
                            name="galaxyHistoryName"
                            value={this.state.galaxyHistoryName}
                            onChange={this.handleInputChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleModalClose}>Cancel</Button>
                        <Button
                            onClick={this.handleOkClick}
                            className="btn-primary"
                        >
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

    customButtons() {
        // TECH: <If condition={this.props.showDownload}> was not working with returning multiple items in JSX.Element[], so moved the conditional here.
        if (!this.props.showDownload) {
            return null;
        }

        return getCustomButtonConfigs()
            .filter(tool => tool.isAvailable?.() ?? true)
            .map((tool, index: number) => {
                return (
                    <CustomButton
                        key={tool.id}
                        toolConfig={tool}
                        baseTooltipProps={this.baseTooltipProps}
                        downloadDataAsync={this.props.downloadDataAsync}
                        overlayClassName={this.props.className}
                    />
                );
            });
    }

    public render() {
        return (
            <span className={this.props.className}>
                <ButtonGroup className={this.props.className}>
                    <If condition={this.props.showCopy}>{this.copyButton()}</If>
                    <If condition={this.props.showDownload}>
                        {this.downloadButton()}
                    </If>
                    <If condition={this.props.showGalaxy}>
                        {this.galaxyButton()}
                    </If>
                    {this.customButtons()}
                </ButtonGroup>
            </span>
        );
    }
}
