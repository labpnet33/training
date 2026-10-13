var e=[{title:{en:`Office offline after a port block`,hi:`Port block ke baad office offline`},ticket:{en:`An engineer blocked TFTP on the office router and since then nothing works. Read the filter attached to ge-0/0/1 input.`,hi:`Engineer ne office router par TFTP block kiya aur tab se kuch nahi chalta. ge-0/0/1 input par laga filter padho.`},out:`lab@R1> show configuration firewall family inet filter LAN-EDGE
term BLOCK-TFTP {
    from {
        protocol udp;
        destination-port tftp;
    }
    then {
        count tftp-hits;
        discard;
    }
}

lab@R1> show interfaces ge-0/0/1.0 detail | match Filters
      Input Filters: LAN-EDGE`,q:{en:`Why is everything blocked and what is the fix?`,hi:`Sab kuch kyun block hai aur fix kya hai?`},o:[{en:`Discard cannot be used with count`,hi:`discard ko count ke saath use nahi kar sakte`},{en:`The filter must be attached as output`,hi:`Filter output ke roop mein attach hona chahiye`},{en:`UDP must be written as protocol 17 only`,hi:`UDP sirf protocol 17 likhna chahiye`},{en:`There is no final accept term, so all other packets hit the implicit discard; add term ALLOW-REST then accept`,hi:`Final accept term nahi hai, isliye baaki sab packets implicit discard mein jaate hain; term ALLOW-REST then accept jodo`}],a:3,w:{en:`A packet that matches no term is discarded. Add a last accept term (or count-and-accept) after the block.`,hi:`Jo packet kisi term se match na kare woh discard hota hai. Block ke baad last accept term jodo.`}},{title:{en:`Who can SSH to R1?`,hi:`R1 ko SSH kaun kar sakta hai?`},ticket:{en:`PROTECT-RE is applied on lo0.0 of R1-NAGPUR. The NOC (10.10.10.10) logs in, the user at 10.20.20.50 tries ssh to 10.20.20.1.`,hi:`R1-NAGPUR ke lo0.0 par PROTECT-RE laga hai. NOC (10.10.10.10) login karta hai, 10.20.20.50 ka user 10.20.20.1 par ssh try karta hai.`},out:`lab@R1-NAGPUR> show configuration firewall family inet filter PROTECT-RE
term SSH-NOC { from { source-address { 10.10.10.0/24; } protocol tcp; destination-port ssh; } then accept; }
term ICMP { from { protocol icmp; } then accept; }
term OSPF { from { protocol ospf; } then accept; }
term DENY { then { count re-denied; discard; } }

USER> ssh -l lab 10.20.20.1
ssh: connect to host 10.20.20.1 port 22: Connection timed out`,q:{en:`Why does the user's SSH to the LAN address 10.20.20.1 time out?`,hi:`User ka SSH LAN address 10.20.20.1 par time out kyun hota hai?`},o:[{en:`SSH is disabled on that interface`,hi:`Us interface par SSH disabled hai`},{en:`The lo0 filter protects every address of the router, and the user is not in 10.10.10.0/24`,hi:`lo0 filter router ke har address ko bachata hai, aur user 10.10.10.0/24 mein nahi hai`},{en:`Only the loopback address is filtered`,hi:`Sirf loopback address filter hota hai`},{en:`The user needs an output filter`,hi:`User ko output filter chahiye`}],a:1,w:{en:`Traffic to any address of the router goes to the Routing Engine and passes the lo0 filter. The user hits DENY and the counter rises.`,hi:`Router ke kisi bhi address ka traffic Routing Engine ko jaata hai aur lo0 filter se guzarta hai. User DENY par jaata hai aur counter badhta hai.`}},{title:{en:`OSPF dies after the change`,hi:`Change ke baad OSPF gir gaya`},ticket:{en:`A lo0 filter was committed without commit confirmed. The CLI session is fine, but 40 seconds later the core lost its routes.`,hi:`lo0 filter commit confirmed ke bina commit hua. CLI session theek hai, lekin 40 second baad core ke routes gaye.`},out:`lab@R1> show configuration firewall family inet filter GUARD
term SSH { from { source-address { 10.77.0.0/24; } protocol tcp; destination-port ssh; } then accept; }
term PING { from { protocol icmp; } then accept; }
term DROP { then { count re-drop; discard; } }

lab@R1> show ospf neighbor
lab@R1> show firewall filter GUARD
re-drop                                            1320                   22`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A term accepting protocol ospf before DROP`,hi:`DROP se pehle protocol ospf accept karne wala term`},{en:`A term accepting tcp port 179`,hi:`tcp port 179 accept karne wala term`},{en:`An output filter on lo0`,hi:`lo0 par output filter`},{en:`A prefix-list for the neighbours`,hi:`Neighbours ke liye prefix-list`}],a:0,w:{en:`OSPF hellos are IP protocol 89, not TCP or UDP. They hit DROP (counter 22) and the adjacency expired. BGP port 179 would be needed only for BGP.`,hi:`OSPF hellos IP protocol 89 hain, TCP ya UDP nahi. Woh DROP mein gaye (counter 22) aur adjacency expire hui. tcp 179 sirf BGP ke liye chahiye.`}},{title:{en:`Block with no effect`,hi:`Block jiska koi asar nahi`},ticket:{en:`BAD (10.40.1.66) can still ping SRV. The filter looks right and the counter is zero.`,hi:`BAD (10.40.1.66) ab bhi SRV ko ping kar sakta hai. Filter sahi dikhta hai aur counter zero hai.`},out:`lab@R1-JAIPUR> show interfaces ge-0/0/1.0 detail | match Filters

lab@R1-JAIPUR> show interfaces ge-0/0/2.0 detail | match Filters
      Input Filters: LAN-IN

lab@R1-JAIPUR> show firewall filter LAN-IN
bad-host                                                0                    0`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The term must use destination-address`,hi:`Term ko destination-address use karna chahiye`},{en:`count and discard conflict`,hi:`count aur discard conflict karte hain`},{en:`The filter is attached to the server-side interface ge-0/0/2, where BAD's packets do not arrive as input`,hi:`Filter server-side interface ge-0/0/2 par attach hai, jahan BAD ke packets input ke roop mein nahi aate`},{en:`OSPF must be disabled`,hi:`OSPF disable karna hoga`}],a:2,w:{en:`BAD's packets arrive on ge-0/0/1. Attach the filter as input there; the zero counter is the clue.`,hi:`BAD ke packets ge-0/0/1 par aate hain. Filter ko wahan input par attach karo; zero counter hi clue hai.`}},{title:{en:`Replies lost with all links up`,hi:`Sab links up hain, replies kho gaye`},ticket:{en:`PC1 cannot ping SRV 172.16.30.10 after a contractor enabled rpf-check on both uplinks. Interpret the output.`,hi:`Contractor ne dono uplinks par rpf-check on kiya, uske baad PC1 SRV 172.16.30.10 ko ping nahi kar pa raha. Output interpret karo.`},out:`lab@R1-BRANCH> show route 172.16.30.10
172.16.30.0/24     *[OSPF/10] 00:20:10, metric 2
                    > to 10.0.12.2 via ge-0/0/0.0

lab@R1-BRANCH> show interfaces ge-0/0/2.0 extensive
    RPF Failures: 14
lab@R1-BRANCH> show interfaces ge-0/0/0.0 extensive
    RPF Failures: 0`,q:{en:`Why are replies dropped and what is the best fix for the uplinks?`,hi:`Replies kyun drop ho rahe hain aur uplinks ke liye best fix kya hai?`},o:[{en:`The server is down; remove OSPF`,hi:`Server down hai; OSPF hata do`},{en:`Replies arrive on ge-0/0/2 but the route back uses ge-0/0/0; use rpf-check mode loose on the uplinks`,hi:`Replies ge-0/0/2 par aate hain lekin wapas ka route ge-0/0/0 se hai; uplinks par rpf-check mode loose use karo`},{en:`Increase the MTU on ge-0/0/2`,hi:`ge-0/0/2 ka MTU badhao`},{en:`Delete the static routes`,hi:`Static routes delete karo`}],a:1,w:{en:`Asymmetric paths break strict uRPF. Loose mode (or removal) on uplinks fixes it; keep strict on the single-homed LAN.`,hi:`Asymmetric paths strict uRPF todte hain. Uplinks par loose mode (ya hatana) fix karta hai; single-homed LAN par strict rakho.`}},{title:{en:`Where is the forger?`,hi:`Forger kahan hai?`},ticket:{en:`After the fix, PC2 forges 10.30.30.77 and pings SRV. Decide where spoofed packets are counted.`,hi:`Fix ke baad PC2 10.30.30.77 forge karke SRV ko ping karta hai. Decide karo spoofed packets kahan count hote hain.`},out:`lab@R1-BRANCH> show configuration interfaces ge-0/0/1
unit 0 {
    family inet {
        rpf-check {
            fail-filter RPF-FAIL;
        }
        address 10.20.20.1/24;
    }
}
lab@R1-BRANCH> show route 10.30.30.0/24
10.30.30.0/24      *[OSPF/10] 00:31:00, metric 2
                    > to 10.0.12.2 via ge-0/0/0.0`,q:{en:`What happens to PC2's packet arriving on ge-0/0/1?`,hi:`PC2 ka ge-0/0/1 par aane wala packet ka kya hoga?`},o:[{en:`It is forwarded because the source network exists in the table`,hi:`Forward hoga kyunki source network table mein hai`},{en:`It fails strict RPF (route to 10.30.30.0/24 points out ge-0/0/0), is matched by RPF-FAIL, counted as spoofed and discarded`,hi:`Strict RPF fail hoga (10.30.30.0/24 ka route ge-0/0/0 se jaata hai), RPF-FAIL se match hoga, spoofed ke roop mein count aur discard hoga`},{en:`It is rejected with an ICMP message by default`,hi:`Default mein ICMP message ke saath reject hoga`},{en:`It is accepted because fail-filters always accept`,hi:`Accept hoga kyunki fail-filters hamesha accept karte hain`}],a:1,w:{en:`Strict mode needs the route back to use ge-0/0/1. It does not, so the fail-filter runs; its discard drops the packet and its counter records it.`,hi:`Strict mode ko wapas ka route ge-0/0/1 se chahiye. Aisa nahi hai, isliye fail-filter chalta hai; uska discard packet drop karta hai aur counter record karta hai.`}},{title:{en:`Counting term above the block`,hi:`Block ke upar counting term`},ticket:{en:`The team added a term to count web traffic above a term that blocks a host. Web packets from the blocked host still pass.`,hi:`Team ne web traffic count karne ka term ek host ko block karne wale term ke upar joda. Blocked host ke web packets phir bhi guzarte hain.`},out:`lab@R1> show configuration firewall family inet filter LAN-IN
term WEB { from { protocol tcp; destination-port 80; } then count web-hits; }
term BAD-HOST { from { source-address { 10.40.1.66/32; } } then { count bad-host; discard; } }
term ALLOW-REST { then accept; }`,q:{en:`Why do the host's web packets pass, and what is the fix?`,hi:`Host ke web packets kyun guzarte hain aur fix kya hai?`},o:[{en:`A term with only count accepts the packet; add next term to WEB or move BAD-HOST first`,hi:`Sirf count wala term packet accept karta hai; WEB mein next term jodo ya BAD-HOST ko pehle rakho`},{en:`ALLOW-REST overrides the discard`,hi:`ALLOW-REST discard ko override karta hai`},{en:`Counters cannot match TCP`,hi:`Counters TCP match nahi kar sakte`},{en:`discard only works on UDP`,hi:`discard sirf UDP par chalta hai`}],a:0,w:{en:`WEB has no terminating action, so it accepts matching packets before BAD-HOST is reached. Use insert to move BAD-HOST first or add then next term.`,hi:`WEB mein terminating action nahi hai, isliye BAD-HOST tak pahunchne se pehle hi matching packets accept ho jaate hain. insert se BAD-HOST ko pehle karo ya then next term jodo.`}}];export{e as default};