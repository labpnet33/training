var e=[{title:{en:`The overlapping subnet`,hi:`Overlapping subnet`},ticket:{en:`An engineer cannot give port4 the address 10.0.1.9/24. Read the error and decide what to do.`,hi:`Engineer port4 ko address 10.0.1.9/24 nahi de pa raha. Error padho aur tay karo kya karna hai.`},out:`NK-PUNE-FGT (port4) # set ip 10.0.1.9 255.255.255.0
NK-PUNE-FGT (port4) # end
Subnets overlap between 'port4' and the primary IP of 'port2'
object set operator error, -54 discard the setting
Command fail. Return code -54`,q:{en:`What is the right fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Add a static route for 10.0.1.0/24`,hi:`10.0.1.0/24 ka static route jodo`},{en:`Disable the role on port2`,hi:`port2 ka role disable karo`},{en:`Give port4 a subnet that does not overlap, such as 10.0.3.1/24`,hi:`port4 ko non-overlapping subnet do, jaise 10.0.3.1/24`},{en:`Reboot the firewall`,hi:`Firewall reboot karo`}],a:2,w:{en:`port2 already owns 10.0.1.0/24. Two interfaces cannot share overlapping subnets, so port4 needs its own subnet.`,hi:`port2 ke paas pehle se 10.0.1.0/24 hai. Do interfaces overlapping subnets share nahi kar sakte, isliye port4 ko apna subnet chahiye.`}},{title:{en:`SSH vanished after one word`,hi:`Ek word se SSH gayab`},ticket:{en:`An admin ran one command to add ping to the LAN port, which already allowed ping, HTTPS and SSH. Read the show output after his change.`,hi:`Ek admin ne LAN port par ping jodne ke liye ek command chalaya, jo pehle se ping, HTTPS aur SSH allow karta tha. Uske change ke baad ka show output padho.`},out:`NK-PUNE-FGT (port2) # set allowaccess ping
NK-PUNE-FGT (port2) # show
config system interface
    edit "port2"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess ping
        set alias "LAN"
        set role lan`,q:{en:`What went wrong and what should he have typed?`,hi:`Kya galat hua aur use kya type karna chahiye tha?`},o:[{en:`set replaced the whole list; append would have added a value`,hi:`set ne poori list replace ki; append ek value jodta`},{en:`Nothing is wrong; allowaccess supports one value`,hi:`Kuch galat nahi; allowaccess ek hi value support karta hai`},{en:`The role must be wan`,hi:`Role wan hona chahiye`},{en:`He needed a commit`,hi:`Use commit chahiye tha`}],a:0,w:{en:`On list attributes set replaces the list. With ping alone, SSH and the HTTPS admin service are gone. append would have kept them.`,hi:`List attributes par set list replace karta hai. Sirf ping bachne par SSH aur HTTPS admin service chale gaye. append unhe rakhta.`}},{title:{en:`The WAN that answers admins`,hi:`WAN jo admins ko jawab deta hai`},ticket:{en:`An audit says the firewall answers management from the internet. Look at the WAN interface.`,hi:`Audit kehta hai firewall internet se management ka jawab deta hai. WAN interface dekho.`},out:`NK-PUNE-FGT # show system interface port1
config system interface
    edit "port1"
        set ip 203.0.113.2 255.255.255.252
        set allowaccess ping ssh
        set alias "WAN"
        set role wan`,q:{en:`Which change closes the finding while keeping ping for the ISP?`,hi:`Kaunsa change finding band karta hai aur ISP ke liye ping rakhta hai?`},o:[{en:`Set role lan on port1`,hi:`port1 par role lan set karo`},{en:`Delete the default route`,hi:`Default route delete karo`},{en:`Append the HTTPS admin service to allowaccess`,hi:`allowaccess mein HTTPS admin service append karo`},{en:`Set allowaccess ping on port1`,hi:`port1 par set allowaccess ping karo`}],a:3,w:{en:`allowaccess ssh on the WAN exposes the SSH admin service. Replace the list with ping only; role never changes what answers.`,hi:`WAN par allowaccess ssh SSH admin service expose karta hai. List ko sirf ping se replace karo; role kabhi nahi badalta ki kya jawab deta hai.`}},{title:{en:`Route to a port that does not exist`,hi:`Aise port ka route jo exist nahi karta`},ticket:{en:`A script tries to create a backup route and fails. Read the reply.`,hi:`Ek script backup route banane ki koshish karti hai aur fail hoti hai. Reply padho.`},out:`NK-PUNE-FGT # config router static
NK-PUNE-FGT (static) # edit 2
new entry '2' added
NK-PUNE-FGT (2) # set device port9
value parse error before 'port9'
Command fail. Return code -651`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`The routing table is full`,hi:`Routing table bhari hai`},{en:`port9 is not an interface that exists on this device`,hi:`port9 is device par exist karne wala interface nahi hai`},{en:`The gateway is missing`,hi:`Gateway missing hai`},{en:`Static routes cannot have a number 2`,hi:`Static routes ka number 2 nahi ho sakta`}],a:1,w:{en:`The device value must name an existing interface. This lab firewall has port1 to port8 only.`,hi:`device value existing interface ka naam honi chahiye. Is lab firewall mein sirf port1 se port8 hain.`}},{title:{en:`Ticket NK-7713: the GUI`,hi:`Ticket NK-7713: GUI`},ticket:{en:`The LAN admin cannot ping the gateway or open the GUI, but PCs reach the internet. Read the LAN port.`,hi:`LAN admin gateway ko ping nahi kar pata aur GUI nahi khol pata, par PCs internet tak pahunchte hain. LAN port padho.`},out:`NK-PUNE-FGT # show system interface port2
config system interface
    edit "port2"
        set vdom "root"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess ssh
        set alias "LAN"
        set role lan

PC1> ping 10.0.1.1
10.0.1.1 icmp_seq=1 timeout
10.0.1.1 icmp_seq=2 timeout
10.0.1.1 icmp_seq=3 timeout
10.0.1.1 icmp_seq=4 timeout
10.0.1.1 icmp_seq=5 timeout
PC1> ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms`,q:{en:`Which change fixes it without breaking SSH?`,hi:`Kaunsa change SSH tode bina isse theek karta hai?`},o:[{en:`Edit port2 and replace allowaccess with ping and the HTTPS admin service`,hi:`port2 edit karo aur allowaccess ko ping aur HTTPS admin service se replace karo`},{en:`Edit port2 and append ping and the HTTPS admin service to allowaccess`,hi:`port2 edit karo aur allowaccess mein ping aur HTTPS admin service append karo`},{en:`Add a firewall policy from port2 to port2`,hi:`port2 se port2 ki firewall policy jodo`},{en:`Enable NAT on port2`,hi:`port2 par NAT enable karo`}],a:1,w:{en:`Through-traffic works, so the fault is in to-the-box access: allowaccess has only ssh. append adds ping and the HTTPS admin service and keeps ssh; set would replace the list.`,hi:`Through-traffic chal raha hai, isliye fault box tak ke access mein hai: allowaccess mein sirf ssh hai. append ping aur HTTPS admin service jodta hai aur ssh rakhta hai; set list replace karta.`}},{title:{en:`A backup route that is not in the table`,hi:`Backup route jo table mein nahi hai`},ticket:{en:`A trainee configured a backup default route and is worried it is not active. Read both outputs.`,hi:`Ek trainee ne backup default route configure kiya aur chinta mein hai ki woh active nahi hai. Dono outputs padho.`},out:`NK-PUNE-FGT # show router static
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
    edit 2
        set gateway 198.51.100.1
        set distance 20
        set device "port4"
    next
end

NK-PUNE-FGT # get router info routing-table static
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]`,q:{en:`What is the correct explanation?`,hi:`Sahi explanation kya hai?`},o:[{en:`The backup route is broken`,hi:`Backup route toota hua hai`},{en:`port4 needs role wan`,hi:`port4 ko role wan chahiye`},{en:`Static routes cannot coexist`,hi:`Static routes saath nahi reh sakte`},{en:`The distance 20 route is a floating backup that enters the table only if the distance 10 route disappears`,hi:`Distance 20 wala route floating backup hai jo sirf distance 10 route gayab hone par table mein aata hai`}],a:3,w:{en:`Lower distance wins. The backup is configured and waiting, which is exactly the floating route design.`,hi:`Kam distance jeetta hai. Backup configured hai aur intezaar kar raha hai, yahi floating route design hai.`}},{title:{en:`No exit for the firewall itself`,hi:`Firewall ke liye bahar ka rasta nahi`},ticket:{en:`After a script run, the firewall cannot reach the internet. Read the output.`,hi:`Script chalne ke baad firewall internet tak nahi pahunch pa raha. Output padho.`},out:`NK-PUNE-FGT # get router info routing-table all
Routing table for VRF=0
C       10.0.1.0/24 is directly connected, port2
C       203.0.113.0/30 is directly connected, port1

NK-PUNE-FGT # execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
--- 8.8.8.8 ping statistics ---
5 packets transmitted, 0 packets received, 100% packet loss`,q:{en:`What must be restored?`,hi:`Kya restore karna hai?`},o:[{en:`A default route via the ISP gateway on port1`,hi:`port1 par ISP gateway ke through default route`},{en:`The LAN policy`,hi:`LAN policy`},{en:`allowaccess on port1`,hi:`port1 par allowaccess`},{en:`The hostname`,hi:`Hostname`}],a:0,w:{en:`There is no S* line, so the firewall has no next hop to 8.8.8.8. Re-create the default route with gateway 203.0.113.1 and device port1.`,hi:`S* line nahi hai, isliye firewall ke paas 8.8.8.8 ka next hop nahi. Gateway 203.0.113.1 aur device port1 ke saath default route dobara banao.`}}];export{e as default};