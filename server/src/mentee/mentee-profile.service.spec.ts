import { Test } from '@nestjs/testing';
import { MenteeProfileService } from './mentee-profile.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MenteeProfileService in-person preference', () => {
  let service: MenteeProfileService;
  let savedPreference: boolean;

  const makeProfile = () => ({
    id: 'mentee-1',
    userId: 'user-1',
    openToInPerson: savedPreference,
    user: { linkedinURL: null, scheduleURL: null },
    goalDisciplines: [],
    wantedSkills: [],
    targetedIndustries: [],
    availability: [],
  });

  const tx = {
    user: { update: jest.fn() },
    menteeProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    savedPreference = false;
    tx.menteeProfile.findUnique.mockImplementation(() =>
      Promise.resolve(makeProfile()),
    );
    tx.menteeProfile.update.mockImplementation(
      ({ data }: { data: { openToInPerson?: boolean } }) => {
        if (data.openToInPerson !== undefined) {
          savedPreference = data.openToInPerson;
        }
        return Promise.resolve(makeProfile());
      },
    );
    const module = await Test.createTestingModule({
      providers: [
        MenteeProfileService,
        {
          provide: PrismaService,
          useValue: {
            ...tx,
            $transaction: async (
              callback: (transaction: typeof tx) => Promise<unknown>,
            ) => callback(tx),
          },
        },
      ],
    }).compile();
    service = module.get(MenteeProfileService);
  });

  it('saves an opt-in, then saves an opt-out and returns it on reload', async () => {
    const optedIn = await service.updateMenteeProfile('user-1', {
      openToInPerson: true,
    });
    expect(optedIn.openToInPerson).toBe(true);

    const optedOut = await service.updateMenteeProfile('user-1', {
      openToInPerson: false,
    });
    expect(optedOut.openToInPerson).toBe(false);
    expect(tx.menteeProfile.update).toHaveBeenLastCalledWith({
      where: { id: 'mentee-1' },
      data: { openToInPerson: false },
    });

    const reloaded = await service.getMenteeProfile('user-1');
    expect(reloaded.openToInPerson).toBe(false);
    expect(reloaded).not.toHaveProperty('openToRemote');
  });

  it('preserves the preference when an unrelated field is updated', async () => {
    savedPreference = true;
    const result = await service.updateMenteeProfile('user-1', {
      bio: 'Updated bio',
    });
    expect(tx.menteeProfile.update).toHaveBeenCalledWith({
      where: { id: 'mentee-1' },
      data: { bio: 'Updated bio' },
    });
    expect(result.openToInPerson).toBe(true);
  });
});
