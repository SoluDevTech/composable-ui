.PHONY: trivy-fs trivy-image trivy-fs-critical trivy-image-critical

trivy-fs:
	trivy fs --severity CRITICAL,HIGH,MEDIUM --config trivy.yaml .

trivy-image:
	trivy image --severity CRITICAL,HIGH,MEDIUM --config trivy.yaml kaiohz/pickpro:composable-ui-latest

trivy-fs-critical:
	trivy fs --severity CRITICAL --exit-code 1 --config trivy.yaml .

trivy-image-critical:
	trivy image --severity CRITICAL --exit-code 1 --config trivy.yaml kaiohz/pickpro:composable-ui-latest
