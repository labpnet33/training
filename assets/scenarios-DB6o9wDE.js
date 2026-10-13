var e=[{title:{en:`The bundle that does not exist`,hi:`Woh bundle jo exist hi nahi karta`},ticket:{en:`SWB in the Indore warehouse has ae0 configured on two members and a trunk on ae0, yet the interface is missing. Read the output.`,hi:`Indore warehouse ke SWB par do members par ae0 configured hai aur ae0 par trunk, phir bhi interface missing hai. Output padho.`},out:`lab@SWB> show interfaces terse ae0
error: device ae0 not found

lab@SWB> show configuration chassis
(no output)

lab@SWA> show configuration chassis
aggregated-devices {
    ethernet {
        device-count 1;
    }
}`,q:{en:`What is missing on SWB?`,hi:`SWB par kya missing hai?`},o:[{en:`chassis aggregated-devices ethernet device-count`,hi:`chassis aggregated-devices ethernet device-count`},{en:`protocols lacp`,hi:`protocols lacp`},{en:`minimum-links 1`,hi:`minimum-links 1`},{en:`interface-mode trunk on the members`,hi:`Members par interface-mode trunk`}],a:0,w:{en:`Without device-count Junos commits the configuration but never creates ae0. Add device-count on SWB.`,hi:`device-count ke bina Junos configuration commit kar leta hai lekin ae0 kabhi nahi banata. SWB par device-count jodo.`}},{title:{en:`Nobody is talking`,hi:`Koi baat nahi kar raha`},ticket:{en:`ae0 now exists on both switches but the bundle is down. Read the LACP output from SWA.`,hi:`Ab dono switches par ae0 exist karta hai lekin bundle down hai. SWA ka LACP output padho.`},out:`lab@SWA> show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/4       Actor    No    No    No   No   No   Yes     Slow   Passive
      ge-0/0/4     Partner    No   Yes    No   No   No    No     Slow   Passive
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                 Defaulted     No periodic                 Detached`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Reboot both switches`,hi:`Dono switches reboot karo`},{en:`Configure lacp active on at least one side`,hi:`Kam se kam ek side par lacp active configure karo`},{en:`Raise the MTU on ae0`,hi:`ae0 par MTU badhao`},{en:`Remove minimum-links`,hi:`minimum-links hatao`}],a:1,w:{en:`Passive plus passive never exchanges LACPDUs: the partner is Defaulted and the member is Detached. One side must be active.`,hi:`Passive plus passive kabhi LACPDUs exchange nahi karte: partner Defaulted aur member Detached. Ek side active honi chahiye.`}},{title:{en:`One member waits`,hi:`Ek member intezaar karta hai`},ticket:{en:`LACP now talks, but SWA reports only half the expected bandwidth. Read the output.`,hi:`Ab LACP baat karta hai, lekin SWA sirf aadhi expected bandwidth batata hai. Output padho.`},out:`lab@SWA> show lacp interfaces
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                   Current   Slow periodic  Collecting distributing
      ge-0/0/5                   Current   Slow periodic                  Waiting

lab@SWA> show configuration interfaces ge-0/0/5
ether-options {
    802.3ad ae0;
    speed {
        100m;
    }
}`,q:{en:`Which action lets ge-0/0/5 join the bundle?`,hi:`Kaunsa action ge-0/0/5 ko bundle mein judne deta hai?`},o:[{en:`Set lacp periodic fast`,hi:`lacp periodic fast set karo`},{en:`Add the member to a second ae interface`,hi:`Member ko doosre ae interface mein jodo`},{en:`Change SWB to passive`,hi:`SWB ko passive karo`},{en:`Delete interfaces ge-0/0/5 ether-options speed`,hi:`interfaces ge-0/0/5 ether-options speed delete karo`}],a:3,w:{en:`A member forced to 100 Mbps does not match its siblings, so LACP keeps it in Waiting. Remove the speed statement and both members aggregate.`,hi:`100 Mbps par forced member apne saathiyon se match nahi karta, isliye LACP use Waiting mein rakhta hai. Speed statement hatao to dono members aggregate ho jaate hain.`}},{title:{en:`Gateway that will not answer ping`,hi:`Gateway jo ping ka jawab nahi deta`},ticket:{en:`PC1 reaches 198.51.100.1 through the VRRP gateway but its ping to the gateway address 172.16.10.1 times out. Read the output from R1, the master.`,hi:`PC1 VRRP gateway ke through 198.51.100.1 tak pahunchta hai lekin gateway address 172.16.10.1 ka ping timeout hota hai. Master R1 ka output padho.`},out:`PC1> ping 172.16.10.1
172.16.10.1 icmp_seq=1 timeout
172.16.10.1 icmp_seq=2 timeout

PC1> ping 198.51.100.1
84 bytes from 198.51.100.1 icmp_seq=1 ttl=63 time=0.500 ms

lab@R1> show vrrp detail
  Interface state: up, Group: 10, State: master, VRRP Mode: Active
  Priority: 200, Advertisement interval: 1, Authentication type: none
  Preempt: yes, Accept-data mode: no, VIP count: 1, VIP: 172.16.10.1`,q:{en:`What explains the failed ping?`,hi:`Failed ping ko kya explain karta hai?`},o:[{en:`Preempt is on`,hi:`Preempt on hai`},{en:`The advertise interval is too short`,hi:`Advertise interval bahut chhota hai`},{en:`Accept-data is not configured, so the master drops packets sent to the VIP`,hi:`Accept-data configured nahi, isliye master VIP par aaye packets drop karta hai`},{en:`The virtual MAC is wrong`,hi:`Virtual MAC galat hai`}],a:2,w:{en:`Transit traffic still works, but a non-owner master discards packets addressed to the VIP unless accept-data is set.`,hi:`Transit traffic chalta hai, lekin non-owner master VIP par addressed packets discard karta hai jab tak accept-data set na ho.`}},{title:{en:`Failover that did not happen`,hi:`Failover jo hua hi nahi`},ticket:{en:`R1 (priority 150) tracks its uplink with a cost of 40; R2 has priority 100. The uplink failed and users lost the Internet. Read the tracking output.`,hi:`R1 (priority 150) apna uplink 40 ki cost se track karta hai; R2 ki priority 100. Uplink fail hua aur users ne Internet kho diya. Tracking output padho.`},out:`lab@R1> show vrrp track
Track Int/Route      State    Speed  VRRP Int      Group  VR State  Current prio  Cost
ge-0/0/0.0           down     0      ge-0/0/1.0       10  master             110    40

lab@R2> show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   backup   Active    D 3.609  lcl    172.16.10.3
                                                              vip    172.16.10.1
                                                              mas    172.16.10.2`,q:{en:`How do you fix the design?`,hi:`Design kaise theek karoge?`},o:[{en:`Disable preempt on R2`,hi:`R2 par preempt disable karo`},{en:`Use a priority-cost above 50 so R1 falls below 100`,hi:`50 se upar priority-cost lo taaki R1 100 se neeche aa jaaye`},{en:`Raise R2 to 255`,hi:`R2 ko 255 karo`},{en:`Remove accept-data`,hi:`accept-data hatao`}],a:1,w:{en:`150 minus 40 is 110, still higher than R2's 100, so R1 stays master. Any cost above 50 flips mastership. 255 is reserved for the address owner.`,hi:`150 minus 40 = 110, R2 ke 100 se zyada, isliye R1 master rehta hai. 50 se upar koi bhi cost mastership flip karti hai. 255 address owner ke liye reserved hai.`}},{title:{en:`NSR refuses to commit`,hi:`NSR commit hone se inkaar karta hai`},ticket:{en:`An engineer enabled nonstop routing on a dual-RE router and the commit check failed. Read the output.`,hi:`Ek engineer ne dual-RE router par nonstop routing enable ki aur commit check fail hua. Output padho.`},out:`lab@R1# commit check
[edit routing-options]
  'graceful-restart'
    graceful restart and nonstop routing cannot be enabled at the same time
error: configuration check-out failed`,q:{en:`What should the engineer do?`,hi:`Engineer ko kya karna chahiye?`},o:[{en:`Remove nonstop-routing and keep graceful-restart, or remove graceful-restart to keep NSR`,hi:`nonstop-routing hatao aur graceful-restart rakho, ya NSR rakhne ke liye graceful-restart hatao`},{en:`Add a second graceful-restart statement`,hi:`Doosra graceful-restart statement jodo`},{en:`Enable BFD`,hi:`BFD enable karo`},{en:`Reboot the backup RE`,hi:`Backup RE reboot karo`}],a:0,w:{en:`NSR and graceful restart are mutually exclusive. With NSR the backup already holds protocol state, so graceful restart is not needed; remember NSR also requires GRES and commit synchronize.`,hi:`NSR aur graceful restart ek doosre ko exclude karte hain. NSR mein backup ke paas protocol state pehle se hai, isliye graceful restart ki zaroorat nahi; yaad rakho NSR ko GRES aur commit synchronize bhi chahiye.`}},{title:{en:`Virtual Chassis priority rejected`,hi:`Virtual Chassis priority reject hui`},ticket:{en:`An engineer builds a preprovisioned Virtual Chassis and tries to give member 1 a higher priority. Read the output.`,hi:`Ek engineer preprovisioned Virtual Chassis banata hai aur member 1 ko zyada priority dene ki koshish karta hai. Output padho.`},out:`lab@DS1# set virtual-chassis member 1 mastership-priority 200
lab@DS1# commit check
[edit virtual-chassis member 1]
  'mastership-priority'
    mastership-priority cannot be set in a preprovisioned Virtual Chassis (the role decides it)
error: configuration check-out failed`,q:{en:`How is mastership decided in this mode?`,hi:`Is mode mein mastership kaise tay hoti hai?`},o:[{en:`By the lowest MAC address only`,hi:`Sirf sabse kam MAC address se`},{en:`By uptime`,hi:`Uptime se`},{en:`By the configured role: routing-engine members are eligible (priority 129), line-card members are not (0)`,hi:`Configured role se: routing-engine members eligible (priority 129), line-card members nahi (0)`},{en:`By the LACP system priority`,hi:`LACP system priority se`}],a:2,w:{en:`In preprovisioned mode the role decides the priority and only listed serial numbers join. Give the two RE-capable members the routing-engine role.`,hi:`Preprovisioned mode mein role priority tay karta hai aur sirf listed serial numbers join karte hain. Do RE-capable members ko routing-engine role do.`}}];export{e as default};