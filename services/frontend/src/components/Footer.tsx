import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router';
import { Separator } from './ui/separator';

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={className}>
      <Separator />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
        <Link to="/">
          <div className="flex items-center text-muted-foreground gap-3 font-semibold">
            CoTex
          </div>
        </Link>

        <div className="flex items-center gap-4 text-muted-foreground">
          <Link
            to="https://github.com/tanujsharma911/CoTex"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className="size-5" />
          </Link>
          <Link
            to="https://x.com/tanujsharma911"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter className="size-5" />
          </Link>
          <Link
            to="https://www.linkedin.com/in/tanujsharma911/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="size-5" />
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6">
        <p className="text-center font-medium text-balance text-muted-foreground">By Tanuj Sharma</p>
      </div>
    </footer>
  );
};

export default Footer;
