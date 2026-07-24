import { Test, TestingModule } from '@nestjs/testing';
import { HelloController } from './hello.controller';

describe('HelloController', () => {
  let controller: HelloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelloController],
    }).compile();

    controller = module.get<HelloController>(HelloController);
  });

  describe('getHello', () => {
    it('returns the Hello World message', () => {
      expect(controller.getHello()).toEqual({
        message: 'Hello World',
      });
    });
  });
});
