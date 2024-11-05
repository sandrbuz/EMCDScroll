import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from "./UserFeed.module.css";

/**
 * Represents user data fetched from the API.
 * @typedef {Object} User
 * @property {Object} login - Contains a unique identifier for the user.
 * @property {string} login.uuid - Unique user ID.
 * @property {Object} picture - Contains URLs for user images.
 * @property {string} picture.large - URL of the user's large profile picture.
 * @property {Object} name - Contains the user's first and last name.
 * @property {string} name.first - First name of the user.
 * @property {string} name.last - Last name of the user.
 * @property {string} email - User's email address.
 */
type User = {
  login: { uuid: string };
  picture: { large: string };
  name: { first: string; last: string };
  email: string;
};

/**
 * Props for the UserCard component.
 * @typedef {Object} UserCardProps
 * @property {User} user - User data to display on the card.
 */
type UserCardProps = {
  user: User;
};

/**
 * Renders a card displaying user information.
 * @param {UserCardProps} props - Props for the UserCard component.
 * @param {React.Ref<HTMLDivElement>} ref - Ref for the UserCard component.
 * @returns {JSX.Element} A card with user data (image, name, email).
 */
const UserCard = React.memo(React.forwardRef<HTMLDivElement, UserCardProps>(({ user }, ref) => (
  <div ref={ref} className={styles.userCard}>
    <img src={user.picture.large} alt={`${user.name.first} ${user.name.last}`} />
    <h3>{`${user.name.first} ${user.name.last}`}</h3>
    <p>Email: {user.email}</p>
  </div>
)));

/**
 * Fetches and displays a list of user cards, loading more users as the end of the list is reached.
 * Implements infinite scrolling.
 * @component
 * @returns {JSX.Element} User feed component.
 */
const UserFeed: React.FC = React.memo(() => {
  const [users, setUsers] = useState<User[]>([]); // State for storing users
  const [loading, setLoading] = useState<boolean>(false); // State for tracking loading status
  const observer = useRef<IntersectionObserver | null>(null); // Ref to hold IntersectionObserver instance
  const lastUserElementRef = useRef<HTMLDivElement | null>(null); // Ref to track the last element

  /**
   * Fetches a batch of user data from the API and updates the state.
   * @async
   * @function fetchUsers
   * @returns {Promise<void>}
   */
  const fetchUsers = async () => {
    setLoading(true);
    const response = await fetch('https://randomuser.me/api/?results=10'); // Fetch 10 users at a time
    const data = await response.json();

    setUsers((prevUsers) => [...prevUsers, ...data.results as User[]]);
    setLoading(false);
  };

  /**
   * Intersection Observer callback to load more users when the last element is visible.
   * @function handleObserver
   * @param {IntersectionObserverEntry[]} entries - Array of intersection entries.
   */
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    if (entry.isIntersecting) {
      fetchUsers();
    }
  }, []);

  /**
   * Sets up and observes the last user element for infinite scrolling.
   */
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(handleObserver);
    if (lastUserElementRef.current) observer.current.observe(lastUserElementRef.current);

    return () => observer.current?.disconnect();
  }, [users, handleObserver]);

  /**
   * Loads initial user data on component mount.
   */
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={styles.userFeed}>
      {users.map((user, index) => {
        // Attach lastUserElementRef to the last user element
        if (index === users.length - 1) {
          return <UserCard ref={lastUserElementRef} key={user.login.uuid} user={user} />;
        }
        return <UserCard key={user.login.uuid} user={user} />;
      })}
      {loading && <p>Loading...</p>}
    </div>
  );
});

export default UserFeed;
