import { initCollage } from './collage.js';
import { initHabits } from './habits.js';
import { runLoader } from './loader.js';
import { initMusic } from './music.js';
import { initRouter } from './router.js';
import { initTorch } from './torch.js';

runLoader();
initTorch();
initMusic();
initRouter();
initCollage();
initHabits();
