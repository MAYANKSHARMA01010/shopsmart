export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          ShopSmart &copy; {new Date().getFullYear()} &mdash; Built by{" "}
          <a target="_blank" rel="noopener noreferrer">
            <strong>Mayank Sharma ❤️</strong>
          </a>
        </p>
      </div>
    </footer>
  );
}
