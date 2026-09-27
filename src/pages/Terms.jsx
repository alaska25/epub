export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">Terms of service</h1>
      <p className="mt-2 text-sm text-ivory/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>
          These terms govern your use of Adyoolau. By creating an account or making
          a purchase, you agree to them.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">1. Your account</h2>
        <p>
          You're responsible for keeping your account credentials secure and for
          any activity that happens under your account. Let us know right away if
          you believe your account has been compromised.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">2. Ebook purchases and licensing</h2>
        <p>
          When you buy a book, you're purchasing a personal license to read and
          download it for your own use. Books are not transferable and may not be
          resold, redistributed, or shared publicly. You may keep your downloaded
          copies indefinitely, including if your account is later closed.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">3. Template purchases and licensing</h2>
        <p>
          When you buy a developer template, you're purchasing a non-exclusive
          license to use the source code as the basis for a single end product
          (for example, one website or application), including for commercial
          projects. You may modify the code freely for that purpose. You may not
          resell, sublicense, or redistribute the template's source code itself —
          as-is or modified — in any form that would allow others to use it as a
          starting template. Reselling or distributing a finished product you've
          built using the template is permitted.
        </p>
        <p className="text-sm text-ivory/50">
          [Placeholder — confirm this matches your intended licensing terms
          (e.g. single-project vs. multi-project use) before publishing.]
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">4. Free titles</h2>
        <p>
          Free books are offered under the same personal-use license as paid
          titles. Claiming a free book adds it to your library the same way a
          purchase would.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">5. Intellectual property</h2>
        <p>
          Aside from the license granted to you above, Adyoolau and its content
          creators retain all rights, title, and interest in the books, templates,
          and site content, including copyright in the underlying code and text.
          The Adyoolau name, logo, and site design are not licensed to you and may
          not be used without permission.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">6. Reviews</h2>
        <p>
          Only readers who own a title may leave a review for it. Reviews should
          reflect your genuine opinion of the book. We reserve the right to remove
          reviews that are abusive, spam, or unrelated to the book itself.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">7. Prohibited conduct</h2>
        <p>
          You agree not to scrape or systematically extract content from the site,
          attempt to circumvent purchase or access controls, reverse-engineer
          paid content for the purpose of avoiding payment, or otherwise misuse
          the platform in a way that harms Adyoolau or other users.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">8. Availability</h2>
        <p>
          We aim to keep the site and your library available at all times, but we
          don't guarantee uninterrupted access and aren't liable for temporary
          outages beyond our control.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">9. Disclaimer and limitation of liability</h2>
        <p>
          Books and templates are provided "as is," without warranty of any kind.
          We don't guarantee that template code is free of bugs or suitable for
          any particular purpose. To the fullest extent permitted by law, Adyoolau
          isn't liable for any indirect, incidental, or consequential damages
          arising from your use of a purchased book or template, including lost
          time, profits, or data.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">10. Refunds</h2>
        <p>
          Purchases are subject to our{" "}
          <a href="/refund-policy" className="text-gold-400 hover:text-gold-300">
            refund policy
          </a>
          .
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">11. Governing law</h2>
        <p>
          These terms are governed by the laws of the Republic of the
          Philippines, without regard to its conflict of law principles.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">12. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continuing to use Adyoolau
          after a change means you accept the updated terms.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">13. Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}