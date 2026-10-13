var e=[{title:{en:`Pair that never formed`,hi:`Pair jo kabhi bana nahi`},ticket:{en:`After a change window, NK-PANORAMA reports it has no peer. The engineer says the HA config was "copied from the runbook". Find the likely cause.`,hi:`Change window ke baad NK-PANORAMA report karta hai ki uska koi peer nahi. Engineer kehta hai HA config "runbook se copy" ki thi. Likely cause dhoondho.`},out:`PANO> show high-availability state

Group 1:
  Mode: Active-Passive (Panorama)
  Local Information:
    Management IP    : 192.0.2.50
    Priority         : primary (preemptive)
    State            : active-primary
  Peer Information:
    Management IP    : 192.0.2.15
    State            : unknown (no Panorama answers on 192.0.2.15)
  Configuration synchronization: peer not available`,q:{en:`What is the most likely cause?`,hi:`Sabse likely cause kya hai?`},o:[{en:`The secondary has a lower priority`,hi:`Secondary ki priority kam hai`},{en:`The peer-ip-address is wrong: it should be the other Panorama management IP 192.0.2.51`,hi:`peer-ip-address galat hai: woh doosre Panorama ka management IP 192.0.2.51 hona chahiye`},{en:`Firewalls lack panorama-server-2`,hi:`Firewalls ke paas panorama-server-2 nahi`},{en:`Preemption is enabled`,hi:`Preemption enabled hai`}],a:1,w:{en:`The output says no Panorama answers on 192.0.2.15. The peer address must be the other Panorama's management IP (192.0.2.51); this looks like a typo. Priority, firewall servers and preemption do not cause an unknown peer.`,hi:`Output kehta hai 192.0.2.15 par koi Panorama answer nahi karta. Peer address doosre Panorama ka management IP (192.0.2.51) hona chahiye; yeh typo lagta hai. Priority, firewall servers aur preemption se peer unknown nahi hota.`}},{title:{en:`Both peers claim primary`,hi:`Dono peers primary claim karte hain`},ticket:{en:`NK-PANORAMA-2 and NK-PANORAMA were both given the same HA block. The second Panorama shows this. What does the output tell you?`,hi:`NK-PANORAMA-2 aur NK-PANORAMA dono ko wahi HA block diya gaya. Doosra Panorama yeh dikhata hai. Output kya batata hai?`},out:`PANO2> show high-availability state

Group 1:
  Mode: Active-Passive (Panorama)
  Local Information:
    Management IP    : 192.0.2.51
    Priority         : primary (non-preemptive)
    State            : active-primary
  Peer Information:
    Management IP    : 192.0.2.50
    State            : unknown (peer 192.0.2.50 points at 192.0.2.15, not at this Panorama (192.0.2.51))
  Configuration synchronization: peer not available`,q:{en:`What should you conclude?`,hi:`Aap kya conclude karoge?`},o:[{en:`The network cable is broken`,hi:`Network cable toot gayi hai`},{en:`Nothing is wrong; this is a normal healthy pair`,hi:`Kuch galat nahi; yeh normal healthy pair hai`},{en:`The peer NK-PANORAMA points at the wrong address, and this side is also set to primary; fix the peer address there and make this one secondary`,hi:`Peer NK-PANORAMA galat address ko point karta hai, aur yeh side bhi primary set hai; wahan peer address fix karo aur ise secondary banao`},{en:`Switch preemption off on both`,hi:`Dono par preemption off karo`}],a:2,w:{en:`The bracket says the peer points at 192.0.2.15, not at this Panorama, and the local priority is primary. Two things are wrong, one per side: the peer address on NK-PANORAMA and the priority on NK-PANORAMA-2.`,hi:`Bracket kehta hai peer 192.0.2.15 ko point karta hai, is Panorama ko nahi, aur local priority primary hai. Do cheezein galat hain, har side ek: NK-PANORAMA ka peer address aur NK-PANORAMA-2 ki priority.`}},{title:{en:`Firewall lost management during maintenance`,hi:`Maintenance mein firewall ne management kho diya`},ticket:{en:`The primary Panorama was suspended for patching. PA1 is fine, but PA3 shows as disconnected from the active Panorama. This is PA3.`,hi:`Patching ke liye primary Panorama suspend hua. PA1 theek hai, par PA3 active Panorama se disconnected dikhta hai. Yeh PA3 hai.`},out:`PA3> show panorama-status

Panorama Server 1 : 192.0.2.50
    Connected     : yes
    HA state      : non-functional`,q:{en:`Why did PA3 lose management?`,hi:`PA3 ne management kyun khoya?`},o:[{en:`PA3 has no panorama-server-2 entry, so it does not know the active secondary at 192.0.2.51`,hi:`PA3 mein panorama-server-2 entry nahi, isliye woh active secondary 192.0.2.51 ko nahi jaanta`},{en:`The secondary has the wrong serial number`,hi:`Secondary ka serial number galat hai`},{en:`PA3 has a wrong WAN gateway`,hi:`PA3 ka WAN gateway galat hai`},{en:`The secondary is non-functional`,hi:`Secondary non-functional hai`}],a:0,w:{en:`Only one server is listed and its HA state is non-functional. The active peer is the secondary, which PA3 was never taught. Add panorama-server-2 in the template, commit, and push from the active Panorama.`,hi:`Sirf ek server listed hai aur uski HA state non-functional hai. Active peer secondary hai, jise PA3 ko kabhi sikhaya nahi gaya. Template mein panorama-server-2 jodo, commit karo aur active Panorama se push karo.`}},{title:{en:`Push refused`,hi:`Push refuse hua`},ticket:{en:`An engineer cannot run commit-all on NK-PANORAMA after a planned failover. He sends this state output.`,hi:`Ek engineer planned failover ke baad NK-PANORAMA par commit-all nahi chala pa raha. Woh yeh state output bhejta hai.`},out:`PANO> show high-availability state

Group 1:
  Mode: Active-Passive (Panorama)
  Local Information:
    Management IP    : 192.0.2.50
    Priority         : primary (preemptive)
    State            : suspended
  Peer Information:
    Management IP    : 192.0.2.51
    State            : active-secondary
  Configuration synchronization: synchronized`,q:{en:`What is the correct action?`,hi:`Sahi action kya hai?`},o:[{en:`Reboot NK-PANORAMA`,hi:`NK-PANORAMA reboot karo`},{en:`Force commit on the suspended peer`,hi:`Suspended peer par commit force karo`},{en:`Change the priority to secondary`,hi:`Priority secondary karo`},{en:`Run commit-all on NK-PANORAMA-2, the active peer, or make NK-PANORAMA functional first`,hi:`commit-all active peer NK-PANORAMA-2 par chalao, ya pehle NK-PANORAMA ko functional karo`}],a:3,w:{en:`NK-PANORAMA is suspended; pushes run only on the active peer, which is NK-PANORAMA-2. After making the primary functional, preemption returns the active role.`,hi:`NK-PANORAMA suspended hai; push sirf active peer par chalte hain, jo NK-PANORAMA-2 hai. Primary ko functional karne ke baad preemption active role lauta deta hai.`}},{title:{en:`Roles flipped after a reboot`,hi:`Reboot ke baad roles flip`},ticket:{en:`After a power blip, a colleague worries that the secondary is now active. Is something broken? This is the primary.`,hi:`Power blip ke baad colleague ko chinta hai ki secondary ab active hai. Kya kuch toota hai? Yeh primary hai.`},out:`PANO> show high-availability state

Group 1:
  Mode: Active-Passive (Panorama)
  Local Information:
    Management IP    : 192.0.2.50
    Priority         : primary (non-preemptive)
    State            : passive-primary
  Peer Information:
    Management IP    : 192.0.2.51
    State            : active-secondary
  Configuration synchronization: synchronized`,q:{en:`What explains this?`,hi:`Isse kya explain hota hai?`},o:[{en:`The pair is split-brain`,hi:`Pair split-brain hai`},{en:`Preemption is off, so the secondary kept the active role after it took over; the pair is healthy and synchronized`,hi:`Preemption off hai, isliye take over ke baad secondary ne active role rakha; pair healthy aur synchronized hai`},{en:`The configuration was lost`,hi:`Configuration lost ho gayi`},{en:`Both peers have the same priority`,hi:`Dono peers ki same priority hai`}],a:1,w:{en:`passive-primary with active-secondary and synchronized is a flipped but healthy pair. Enable preemption on the primary or hand the role back deliberately in a window.`,hi:`passive-primary ke saath active-secondary aur synchronized ek flipped par healthy pair hai. Primary par preemption enable karo ya window mein role jaanbujhkar wapas do.`}},{title:{en:`Policy edit on the wrong peer`,hi:`Galat peer par policy edit`},ticket:{en:`A junior edited a device group on NK-PANORAMA-2 while the pair was healthy. A senior asks what the state implies.`,hi:`Ek junior ne pair healthy hone par NK-PANORAMA-2 par device group edit kiya. Senior poochta hai state kya imply karti hai.`},out:`PANO2> show high-availability state

Group 1:
  Mode: Active-Passive (Panorama)
  Local Information:
    Management IP    : 192.0.2.51
    Priority         : secondary (non-preemptive)
    State            : passive-secondary
  Peer Information:
    Management IP    : 192.0.2.50
    State            : active-primary
  Configuration synchronization: synchronized`,q:{en:`What is the correct guidance?`,hi:`Sahi guidance kya hai?`},o:[{en:`Redo the change on NK-PANORAMA, the active peer, then verify synchronization and push from there`,hi:`Change NK-PANORAMA, active peer, par dobara karo, phir synchronization verify karo aur wahin se push karo`},{en:`Push from NK-PANORAMA-2 as it was edited last`,hi:`NK-PANORAMA-2 se push karo kyunki wahan last edit hua`},{en:`Change both priorities`,hi:`Dono priorities badlo`},{en:`Disable HA`,hi:`HA disable karo`}],a:0,w:{en:`NK-PANORAMA-2 is passive; shared changes belong on the active peer, which is the source of truth and pushes to firewalls.`,hi:`NK-PANORAMA-2 passive hai; shared changes active peer par hote hain, jo source of truth hai aur firewalls ko push karta hai.`}},{title:{en:`Unsynchronized setting after failover`,hi:`Failover ke baad unsynchronized setting`},ticket:{en:`After failover, the new active Panorama cannot resolve a hostname, though all device groups are present. The team asks why only this setting differs.`,hi:`Failover ke baad naya active Panorama ek hostname resolve nahi kar pa raha, jabki saare device groups present hain. Team poochti hai sirf yahi setting alag kyun hai.`},out:`PANO2> show high-availability state
  Local Information:
    State            : active-secondary
  Peer Information:
    State            : suspended
  Configuration synchronization: synchronized

PANO2> show config running (deviceconfig section)
  deviceconfig system
    ip-address 192.0.2.51
    (no DNS settings present)`,q:{en:`What explains the missing setting?`,hi:`Missing setting ko kya explain karta hai?`},o:[{en:`Synchronization failed`,hi:`Synchronization fail hua`},{en:`The secondary lost its device groups`,hi:`Secondary ke device groups gaye`},{en:`deviceconfig is device-local and is not synchronized; it must be set on each Panorama`,hi:`deviceconfig device-local hai aur synchronize nahi hota; har Panorama par set karna padta hai`},{en:`Preemption removed it`,hi:`Preemption ne hata diya`}],a:2,w:{en:`In the lab, everything except deviceconfig is synchronized. DNS and management settings are device-local, so set and track them on both peers.`,hi:`Lab mein deviceconfig ke alawa sab synchronize hota hai. DNS aur management settings device-local hain, isliye dono peers par set aur track karo.`}},{title:{en:`Is the failover really proven?`,hi:`Kya failover sach mein prove hua?`},ticket:{en:`After suspending the primary, an engineer closes the ticket because NK-PANORAMA-2 shows active-secondary. A reviewer asks for more proof. This is a firewall.`,hi:`Primary suspend karne ke baad engineer ticket close kar deta hai kyunki NK-PANORAMA-2 active-secondary dikhata hai. Reviewer aur proof maangta hai. Yeh ek firewall hai.`},out:`PA2> show panorama-status

Panorama Server 1 : 192.0.2.50
    Connected     : yes
    HA state      : non-functional

Panorama Server 2 : 192.0.2.51
    Connected     : yes
    HA state      : active`,q:{en:`What additional proof completes the verification?`,hi:`Kaun sa additional proof verification poora karta hai?`},o:[{en:`Nothing more is needed`,hi:`Aur kuch nahi chahiye`},{en:`Reboot PA2`,hi:`PA2 reboot karo`},{en:`Delete the template`,hi:`Template delete karo`},{en:`Show that a commit-all is accepted from NK-PANORAMA-2 and check devices and logs`,hi:`Dikhao ki NK-PANORAMA-2 se commit-all accept hota hai aur devices tatha logs check karo`}],a:3,w:{en:`The firewall follows the active peer, which is good, but a failover is proven by management working: a push accepted from the new active peer, devices connected and logs forwarding.`,hi:`Firewall active peer ko follow kar raha hai, jo achha hai, par failover tab prove hota hai jab management kaam kare: naye active peer se push accepted, devices connected aur logs forward ho rahe hon.`}}];export{e as default};