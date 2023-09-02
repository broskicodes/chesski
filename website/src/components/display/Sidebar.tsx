import { PropsWithChildren, ReactNode, useState, createContext, useContext } from 'react'
import { FlipBoardIcon } from '../icons/FlibBoardIcon';
import { useRouter } from 'next/router'
import { ProfileIcon } from '../icons/ProfileIcon';
import { useSession } from '../../providers/OddSessionProvider';
import { DisconnectIcon } from '../icons/DisconnectIcon';
import { DeviceLinkIcon } from '../icons/DeivceLinkIcons';
import { PlayChessIcon } from '../icons/PlayChessIcon';
import { MenuIcon } from '../icons/MenuIcon';

const SidebarContext = createContext({ expanded: true });

export const Sidebar = ({ children }: PropsWithChildren) => {
  const { isConnected, username, disconnect } = useSession();
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  return (
    <aside className="h-screen absolute left-0 top-0 z-40">
      <nav className="h-full flex flex-col bg-white shadow-md">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`}>Chesski</div>
          <button onClick={() => setExpanded((curr) => !curr)}             className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
            <MenuIcon height={1.5} />
          </button>
        </div>
        <SidebarContext.Provider value={{ expanded }}>
          <ul className='flex-1 px-3'>
            <SidebarItem icon={PlayChessIcon({ height: 1.5 })} text={"Play Chesski"} active={router.route === "/"} handleClick={() => { router.route === "/" ? {} : router.push("/")}} />
            {children}
            {isConnected() && 
            <div className={`absolute bottom-16`}>
              <SidebarItem icon={DeviceLinkIcon({ height: 1.5 })} text={"Link Device"} handleClick={() => { router.push("/link-device/authed") }} />
              <SidebarItem icon={DisconnectIcon({ height: 1.5 })} text={"Disconnect"} handleClick={disconnect} />
            </div>
            }
          </ul>
        </SidebarContext.Provider>
        {isConnected() && 
          <div className='border-t flex p-3'>
            <div className='py-1 px-3 my-1'>
            <ProfileIcon height={1.5} />
            </div>
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
            `}
            >
              <div className="leading-4">
                <h4 className="font-semibold">User: <span className='font-normal'>{username}</span></h4>
                {/* <span className="text-xs text-gray-600">johndoe@gmail.com</span> */}
              </div>
            </div>
          </div>
        }
      </nav>
    </aside>
  );
};

interface ItemProps {
  icon: ReactNode,
  text: string,
  active?: boolean,
  alert?: boolean,
  handleClick: () => void;
}

export const SidebarItem = ({ icon, text, handleClick, active, alert }: ItemProps) => {
  const { expanded } = useContext(SidebarContext);
  return (
    <li onClick={handleClick} className={`cursor-pointer relative flex items-center py-2 px-3 my-1 rounded-md group ${active ? "bg-red-200" : "hover:bg-red-100"}`}>
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
      {alert && <div className={`absolute right-2 w-2 h-2 rounded bg-red-400 ${expanded ? "" : "top-4"}`} />}
      {!expanded && <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-red-100 text-sm invisible opacity-20 translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>{text}</div>}
    </li>
  )
}