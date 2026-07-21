import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import { useLayoutEffect } from 'react';
import mockImage from '../assets/mock.avif';

//@ts-ignore
import { MoveRight, PencilSparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

const sectionData = [
  {
    title: 'PDF Compilation',
    description:
      'Compile your LaTeX project in a single click and instantly preview the generated PDF alongside your editor.'
  },
  {
    title: 'Share with a Single Link',
    description:
      'Publishing a project creates a shareable URL. Send it to your teammates and start collaborating immediately.'
  },
  {
    title: 'Built in Public',
    description:
      'CoTex is an open-source project built for the developer and academic community.'
  }
];

function Home() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();

  useLayoutEffect(() => {
    if (isAuthenticated) {
      navigate('/project');
    }
  }, [isAuthenticated]);

  return (
    <div className="w-full mt-6 sm:mt-10">
      <section className="grid grid-cols-1 gap-8 sm:gap-12 md:gap-14 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        <div className="mt-6 sm:mt-10">
          <h1 className="scroll-m-20 text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance text-center">
            Collaborative LaTeX, Simplified.
          </h1>

          <p className="mt-3 text-muted-foreground sm:mt-4 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-center">
            Write, edit, compile, and collaborate on LaTeX documents all from
            your browser.
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              to="/project"
              className="flex items-center gap-2 bg-lime-600 dark:bg-lime-300 hover:scale-101 px-3 sm:px-4 py-2 font-semibold rounded-lg text-zinc-100 dark:text-lime-950 transition-all text-sm sm:text-base"
            >
              <PencilSparkles className="size-4 sm:size-5" />
              Start Writing
            </Link>
            <Link
              to="https://github.com/tanujsharma911/collab-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-lime-600/20 dark:bg-lime-300/20 hover:scale-101 font-semibold px-3 sm:px-4 py-2 rounded-lg text-lime-700 dark:text-lime-200 transition-all text-sm sm:text-base"
            >
              GitHub
              <MoveRight className="size-4 sm:size-5" />
            </Link>
          </div>
        </div>
        <div>
          <img
            src={mockImage}
            alt="Real-time collaborative editing with live PDF preview"
            className="rounded-lg w-full h-auto object-cover"
            fetchPriority="high"
          />
        </div>
      </section>

      <section className="my-20 sm:my-32 md:my-40 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        <h2 className="scroll-m-20 text-muted-foreground text-2xl sm:text-3xl md:text-4xl font-heading tracking-tight text-balance text-center">
          <span className="text-foreground">No installations. No setup.</span>{' '}
          Share a link, invite collaborators, and generate beautiful PDFs with a
          single click.
        </h2>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 max-w-5xl mx-auto gap-4 sm:gap-5 px-4 sm:px-6 md:px-8">
        {sectionData.map((data, i) => {
          return (
            <section
              className="md:flex md:items-center md:gap-2 lg:block"
              id={i === 0 ? 'features' : undefined}
              key={i}
            >
              <img
                src={`./img/feature_${i + 1}.avif`}
                alt={data.title}
                className="w-full max-w-90 mx-auto h-auto object-cover rounded-lg"
              />
              <div className="mt-3 sm:mt-4 text-center md:text-left">
                <h1 className="scroll-m-20 text-xl sm:text-2xl font-heading tracking-tight text-balance">
                  {data.title}
                </h1>
                <p className="leading-7 text-muted-foreground mt-3 sm:mt-4 text-sm sm:text-base">
                  {data.description}
                </p>
              </div>
            </section>
          );
        })}
      </div>

      <Footer className="mt-20 sm:mt-32 md:mt-40" />
    </div>
  );
}

export default Home;
