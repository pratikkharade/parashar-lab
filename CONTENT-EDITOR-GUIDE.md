# Updating lab content

The public site is generated entirely from Markdown files in `content/`. No visitor-facing copy is stored in the React components.

## Site-wide copy and contact details

Each page has a descriptive page-content file for page headings, buttons, labels, and other page-specific copy. Home uses `content/home/page_content.md`; shared header and footer copy is in `content/site-configuration.md`.

## Add or update a person

Edit or create a file in `content/team/`. Keep the fields between the `---` lines, then update the short body below them. Use `category` for the section heading and `category_index` to place that section in the Team-page order. Use `index` to order people within their category (ascending). Any new category appears automatically; give every person in that category the same `category_index`.

Add `featured: true` only when a person should use the full-width featured-profile layout. All other people display in the category grid.

Every profile needs a `description` field. The profile-window links are optional: configure `email`, `linkedin`, `github`, and/or `homepage` with their respective destinations. Omit a field or set it to `null` to hide that link. Add an optional `photo` field with the path to an image under `public/` when a real profile photo is available; otherwise, the site displays the person's initials.

## Add a project, publication, or news item

Create a `.md` file in `content/projects/`, `content/publications/`, or `content/news/` by copying an existing file. The filename becomes the record identifier; use lowercase words separated by hyphens.

For each publication, add a `DOI` field such as `DOI: 10.1038/s41597-026-07753-8`. The Publications page links it automatically through `https://www.doi.org/{DOI}`.

Featured project records may include an optional `link` field. When set, the Projects page displays a project link on that record.

The six top-level content folders are `home/`, `projects/`, `publications/`, `team/`, `contact/`, and `news/`. Supporting records live in the folder for the page that displays them: research areas are in `home/areas/` and use an ascending `index`; featured projects are in `projects/featured_projects/` and use a descending `index`; news cards are in `news/news_events/` and use a descending `index`; upcoming events are in `news/upcoming_events/`; join information is in `contact/join/` and uses an ascending `index`; navigation is in `home/navigation/`; and software entries are in `publications/`.

## Publish

On GitHub, edit a file with the pencil icon and commit it to a branch. Open a pull request; when it merges to `main`, GitHub Actions builds and publishes the static site automatically.

All current records are sample content and should be replaced before launch.
