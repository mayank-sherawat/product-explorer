import { Controller, Get } from "@nestjs/common";
import { NavigationService } from "./navigation.service";

@Controller("navigation")
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  async getNavigation() {
    return this.navigationService.getNavigation();
  }
}

