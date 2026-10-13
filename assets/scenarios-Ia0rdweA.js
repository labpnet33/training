var e=(e,t,n,r,i,a,o,s,c,l,u)=>({title:{en:e,hi:t},ticket:{en:n,hi:r},out:i,q:{en:a,hi:o},o:s.map(([e,t])=>({en:e,hi:t||e})),a:c,w:{en:l,hi:u}}),t=[e(`VPN down: proposal mismatch`,`VPN down: proposal mismatch`,`The Delhi to Pune tunnel is down after a maintenance window.`,`Maintenance window ke baad Delhi se Pune tunnel down hai.`,`user@DELHI> show security ike security-associations
No IKE security associations

user@DELHI> show log kmd
IKE negotiation failed with error: No proposal chosen. VPN: VPN1 Gateway: GW1, Local: 203.0.113.2/500, Remote: 198.51.100.2/500`,`What is the most likely cause?`,`Sabse sambhavit karan kya hai?`,[[`The algorithms or DH group differ between the peers`,`Peers ke beech algorithms ya DH group alag hain`],[`The pre-shared key is wrong`,`Pre-shared key galat hai`],[`A route is missing`,`Route missing hai`],[`A policy is missing`,`Policy missing hai`]],0,`No proposal chosen means no common algorithm set.`,`No proposal chosen matlab koi common algorithm set nahi.`),e(`VPN down: key mismatch`,`VPN down: key mismatch`,`After the DH group was corrected, the tunnel is still down.`,`DH group theek karne ke baad bhi tunnel down hai.`,`user@DELHI> show log kmd
IKE negotiation failed with error: Authentication failed. VPN: VPN1 Gateway: GW1, Local: 203.0.113.2/500, Remote: 198.51.100.2/500`,`What should you check now?`,`Ab kya check karna chahiye?`,[[`MTU`,`MTU`],[`The pre-shared key (and IKE identities)`,`Pre-shared key (aur IKE identities)`],[`The NAT pool`,`NAT pool`],[`The screen thresholds`,`Screen thresholds`]],1,`Authentication failures point to the key or identity.`,`Authentication failures key ya identity ki taraf ishara karte hain.`),e(`VPN up, no traffic`,`VPN up, traffic nahi`,`IKE and IPsec SAs are up, yet PC1 cannot reach PC2.`,`IKE aur IPsec SAs up hain, phir bhi PC1, PC2 tak nahi pahunch pa raha.`,`user@DELHI> show security ipsec security-associations
Total active tunnels: 1     Total Ipsec sas: 2

user@DELHI> show route 192.168.20.10
0.0.0.0/0          *[Static/5] 00:12:03
                    >  to 203.0.113.1 via ge-0/0/0.0`,`What is missing?`,`Kya missing hai?`,[[`A route to the remote subnet through st0.0`,`Remote subnet ka st0.0 se route`],[`A bigger lifetime`,`Bada lifetime`],[`A new IKE proposal`,`Naya IKE proposal`],[`A source NAT pool`,`Source NAT pool`]],0,`Traffic follows the default route to the ISP. A route to st0.0 sends it into the tunnel.`,`Traffic default route se ISP jata hai. st0.0 ka route use tunnel mein bhejta hai.`),e(`VPN works one way`,`VPN ek taraf chalta hai`,`Delhi can reach Pune; Pune cannot start connections to Delhi.`,`Delhi Pune tak pahunchta hai; Pune Delhi ko connections shuru nahi kar pata.`,`user@DELHI> show security policies from-zone vpn to-zone trust
Default policy: deny-all
(no policies)`,`What is the fix?`,`Fix kya hai?`,[[`Change the DH group`,`DH group badlo`],[`Add a policy from-zone vpn to-zone trust on Delhi`,`Delhi par from-zone vpn to-zone trust policy jodo`],[`Add a screen on untrust`,`untrust par screen jodo`],[`Delete the tunnel`,`Tunnel delete karo`]],1,`Pune-initiated traffic arrives from the tunnel on Delhi and needs a vpn to trust policy.`,`Pune se shuru traffic Delhi par tunnel se aata hai aur use vpn to trust policy chahiye.`),e(`IKE never arrives`,`IKE kabhi nahi pahunchta`,`The tunnel never comes up after a firewall replacement. The config was copied correctly.`,`Firewall replacement ke baad tunnel kabhi up nahi hota. Config sahi copy hua tha.`,`user@PUNE> show configuration security zones security-zone untrust
interfaces {
    ge-0/0/0.0 {
        host-inbound-traffic {
            system-services {
                ping;
            }
        }
    }
}`,`What is missing?`,`Kya missing hai?`,[[`system-services ike on the untrust interface`,`untrust interface par system-services ike`],[`A static route`,`Static route`],[`A scheduler`,`Scheduler`],[`PFS`,`PFS`]],0,`IKE packets are traffic to the firewall itself; host-inbound-traffic must allow ike.`,`IKE packets firewall ko khud ka traffic hain; host-inbound-traffic ko ike allow karna hoga.`),e(`Phase 1 up, phase 2 fails`,`Phase 1 up, phase 2 fail`,`The IKE SA is UP but the IPsec table is empty.`,`IKE SA UP hai lekin IPsec table khaali hai.`,`user@DELHI> show security ike security-associations
1000    UP  ...  Main  198.51.100.2

user@DELHI> show security ipsec security-associations
Total active tunnels: 0     Total Ipsec sas: 0

user@DELHI> show configuration security ipsec policy IPS-POL
perfect-forward-secrecy { keys group14; }`,`What explains it, given that Pune has no PFS line?`,`Pune mein PFS line na ho to yeh kya explain karta hai?`,[[`A PFS mismatch in phase 2`,`Phase 2 mein PFS mismatch`],[`A wrong key`,`Galat key`],[`A missing screen`,`Missing screen`],[`A full NAT pool`,`Full NAT pool`]],0,`PFS must be on both ends with the same group, or on neither.`,`PFS dono ends par same group ke saath ho, ya kisi par nahi.`)],n=[1,2,3,0,2,1,3],r=t.map((e,t)=>{let r=n[t]%4,i=e.o.map((t,n)=>e.o[(n-r+4)%4]);return{...e,o:i,a:(e.a+r)%4}});export{r as default};