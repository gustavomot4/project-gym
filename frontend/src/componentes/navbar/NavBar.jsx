import styles from './NavBar.module.css';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <a href="/" className={styles.logo}>Gym</a>
      <ul className={styles.links}>
        <li><a href="/" className={styles.link}>Inicio</a></li>
        <li><a href="/about" className={styles.link}>Sobre</a></li>
        <li><a href="/contact" className={styles.link}>Contato</a></li>
        <li><a href="/login" className={styles.link}>Login</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;