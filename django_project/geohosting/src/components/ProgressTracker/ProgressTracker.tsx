import {
  Box,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";

const steps = [
  { title: "Payment", description: "Choose your payment method" },
  { title: "Configuration", description: "Configure your deployment" },
  { title: "Deployment", description: "Deploy your service" },
];

function ProgressTracker({ activeStep }) {
  // Determine if the screen size is small
  const isVertical = useBreakpointValue({ base: true, md: false });

  return (
    <Stepper index={activeStep} orientation={isVertical ? "vertical" : "horizontal"}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon color="green.500" />}
              incomplete={<StepNumber />}
              // @ts-ignore
              active={<StepNumber/>}
            />
          </StepIndicator>
          <Box flexShrink="0">
            <StepTitle>
              {step.title}
            </StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>
          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  );
}

export default ProgressTracker;
