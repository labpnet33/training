var e=[{title:{en:`Interface up, but still no address after the reboot`,hi:`Interface up hai, par reboot ke baad bhi address nahi`},ticket:{en:`Server syslog02 was rebuilt. It comes up with no IP address every time it boots, although the netplan file looks perfect. The engineer pasted the two outputs below. What is wrong?`,hi:`Server syslog02 rebuild hua. Har boot par woh bina IP address ke uthta hai, jabki netplan file bilkul sahi dikhti hai. Engineer ne neeche ke do outputs paste kiye. Kya galat hai?`},out:`netadmin@syslog02:~$ ip -br a
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP

netadmin@syslog02:~$ sudo cat /etc/netplan/50-cloud-init.yaml
# This file was written by the installer.
network:
  version: 2
  ethernets:
    ens160:
      dhcp4: false
      addresses:
        - 10.30.0.10/24`,q:{en:`What is the cause?`,hi:`Wajah kya hai?`},o:[{en:`The /24 prefix is wrong`,hi:`/24 prefix galat hai`},{en:`DHCP is turned off`,hi:`DHCP band kiya hua hai`},{en:`The file configures ens160, but the real interface is eth0`,hi:`File ens160 configure karti hai, par asli interface eth0 hai`},{en:`The interface is administratively down`,hi:`Interface administratively down hai`}],a:2,w:{en:`Netplan applies settings to the interface name in the file. ip shows only eth0, so ens160 does not exist and eth0 stays without an address. Fix the name (sed) and run netplan apply.`,hi:`Netplan file ke interface name par settings lagata hai. ip sirf eth0 dikhata hai, isliye ens160 exist nahi karta aur eth0 bina address ke rehta hai. Naam theek karo (sed) aur netplan apply chalao.`}},{title:{en:`Gateway pings, nothing beyond`,hi:`Gateway ping hota hai, uske aage kuch nahi`},ticket:{en:`The new server can ping its own gateway 10.30.0.1, but the NMS at 10.10.0.10 fails. Read the output. What is missing?`,hi:`Naya server apne gateway 10.30.0.1 ko ping kar sakta hai, par 10.10.0.10 wala NMS fail hota hai. Output padho. Kya missing hai?`},out:`netadmin@syslog02:~$ ip route
10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10

netadmin@syslog02:~$ ping -c 3 10.10.0.10
ping: connect: Network is unreachable`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add a default route via 10.30.0.1`,hi:`10.30.0.1 ke through default route jodo`},{en:`Install dnsutils`,hi:`dnsutils install karo`},{en:`Change the interface MTU`,hi:`Interface MTU badlo`},{en:`Restart the NMS web server`,hi:`NMS web server restart karo`}],a:0,w:{en:`Only the connected route exists. Without a default route the kernel has no way to reach other subnets and refuses to send. sudo ip route add default via 10.30.0.1, then make it permanent in netplan.`,hi:`Sirf connected route hai. Default route ke bina kernel doosre subnets tak pahunch nahi sakta aur bhejne se mana kar deta hai. sudo ip route add default via 10.30.0.1, phir netplan mein permanent karo.`}},{title:{en:`Works by IP, not by name`,hi:`IP se chalta hai, naam se nahi`},ticket:{en:`Ping to 10.10.0.10 works, but names fail. The engineer collected this. Where is the fault?`,hi:`10.10.0.10 ka ping chalta hai, par names fail hote hain. Engineer ne yeh collect kiya. Fault kahan hai?`},out:`netadmin@syslog02:~$ ping -c 2 nms.nk.lab
ping: nms.nk.lab: Temporary failure in name resolution

netadmin@syslog02:~$ cat /etc/resolv.conf
nameserver 10.30.0.53
search nk.lab

netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.53
;; communications error to 10.30.0.53#53: timed out
;; no servers could be reached

netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.1
Server:         10.30.0.1
Address:        10.30.0.1#53

Name:   nms.nk.lab
Address: 10.10.0.10`,q:{en:`What should you do?`,hi:`Aapko kya karna chahiye?`},o:[{en:`Add a static route to 10.10.0.0/24`,hi:`10.10.0.0/24 ka static route jodo`},{en:`Open port 53 on the NMS`,hi:`NMS par port 53 kholo`},{en:`Reinstall the ping package`,hi:`ping package dobara install karo`},{en:`Change the nameserver in netplan from 10.30.0.53 to 10.30.0.1 and apply`,hi:`Netplan mein nameserver 10.30.0.53 se 10.30.0.1 karo aur apply karo`}],a:3,w:{en:`IP reachability works, so routing is fine. The configured DNS server 10.30.0.53 does not answer, while 10.30.0.1 does. Fix nameservers in netplan so the change survives a reboot.`,hi:`IP reachability chalti hai, to routing theek hai. Configured DNS server 10.30.0.53 jawab nahi deta, jabki 10.30.0.1 deta hai. Netplan mein nameservers fix karo taaki change reboot ke baad bhi rahe.`}},{title:{en:`Port 8080 gives an error`,hi:`Port 8080 error deta hai`},ticket:{en:`A tester checks two TCP ports on the NMS 10.10.0.10 from the new server. What do these results say about port 8080?`,hi:`Tester naye server se NMS 10.10.0.10 ke do TCP ports check karta hai. Port 8080 ke baare mein yeh results kya kehte hain?`},out:`netadmin@syslog02:~$ nc -zv 10.10.0.10 22
Connection to 10.10.0.10 22 port [tcp/ssh] succeeded!

netadmin@syslog02:~$ nc -zv 10.10.0.10 8080
nc: connect to 10.10.0.10 port 8080 (tcp) failed: Connection refused`,q:{en:`What does "Connection refused" mean here?`,hi:`Yahan "Connection refused" ka kya matlab hai?`},o:[{en:`A firewall is silently dropping the packets`,hi:`Firewall chupchaap packets drop kar raha hai`},{en:`The host answered, but no program listens on port 8080`,hi:`Host ne jawab diya, par port 8080 par koi program nahi sun raha`},{en:`The route to the NMS is missing`,hi:`NMS ka route missing hai`},{en:`DNS failed to resolve the name`,hi:`DNS name resolve nahi kar paya`}],a:1,w:{en:`Refused means the NMS sent back a reset, so the network works and the host is alive. Nothing listens on 8080. A firewall drop or missing route would give a timeout instead.`,hi:`Refused matlab NMS ne reset wapas bheja, to network chalta hai aur host zinda hai. 8080 par kuch nahi sun raha. Firewall drop ya missing route timeout deta.`}},{title:{en:`The address will not stick`,hi:`Address lag nahi raha`},ticket:{en:`A junior engineer tries to give eth0 an address and gets an error. What explains it?`,hi:`Junior engineer eth0 ko address dene ki koshish karta hai aur error milta hai. Kya explain karta hai?`},out:`netadmin@syslog02:~$ ip addr add 10.30.0.10/24 dev eth0
RTNETLINK answers: Operation not permitted

netadmin@syslog02:~$ ip -br a
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP`,q:{en:`What should he do?`,hi:`Use kya karna chahiye?`},o:[{en:`Reboot the server`,hi:`Server reboot karo`},{en:`Edit /etc/resolv.conf`,hi:`/etc/resolv.conf edit karo`},{en:`Run the same command with sudo`,hi:`Wahi command sudo ke saath chalao`},{en:`Change the MAC address`,hi:`MAC address badlo`}],a:2,w:{en:`Changing addresses needs administrator rights. "Operation not permitted" means the command ran as an ordinary user. Use sudo ip addr add, then write the address into netplan so it is permanent.`,hi:`Address badalne ke liye administrator rights chahiye. "Operation not permitted" matlab command ordinary user ki tarah chala. sudo ip addr add use karo, phir address ko netplan mein likho taaki permanent ho.`}},{title:{en:`How far away is the NMS?`,hi:`NMS kitni door hai?`},ticket:{en:`A colleague asks how many routers sit between the server and the NMS. You have these two pings and a trace.`,hi:`Colleague poochta hai server aur NMS ke beech kitne routers hain. Aapke paas yeh do pings aur ek trace hai.`},out:`netadmin@syslog02:~$ ping -c 1 10.30.0.1
64 bytes from 10.30.0.1: icmp_seq=1 ttl=255 time=0.50 ms

netadmin@syslog02:~$ ping -c 1 10.10.0.10
64 bytes from 10.10.0.10: icmp_seq=1 ttl=63 time=0.50 ms

netadmin@syslog02:~$ tracepath 10.10.0.10
 1?: [LOCALHOST]                      pmtu 1500
 1:   10.30.0.1                        0.510ms
 2:   10.10.0.10                       0.720ms reached
     Resume: pmtu 1500 hops 2 back 2`,q:{en:`How many routers are between them?`,hi:`Unke beech kitne routers hain?`},o:[{en:`One: the gateway 10.30.0.1`,hi:`Ek: gateway 10.30.0.1`},{en:`Two`,hi:`Do`},{en:`Sixty-three`,hi:`Tirsath`},{en:`None, the NMS is on the same subnet`,hi:`Koi nahi, NMS same subnet par hai`}],a:0,w:{en:`Hop 1 is the gateway, hop 2 is the NMS itself (reached). The TTL of 63 is 64 minus one router. TTL is the start value minus routers crossed, not a hop count.`,hi:`Hop 1 gateway hai, hop 2 khud NMS (reached). TTL 63 matlab 64 minus ek router. TTL start value minus cross kiye routers hai, hop count nahi.`}},{title:{en:`Who is complaining in this ping?`,hi:`Is ping mein kaun shikayat kar raha hai?`},ticket:{en:`Someone pings a host that does not exist and reads the result as "the gateway is down". Look at the From field.`,hi:`Koi aise host ko ping karta hai jo exist nahi karta aur result ko "gateway down hai" samajhta hai. From field dekho.`},out:`netadmin@syslog02:~$ ping -c 2 10.10.0.99
PING 10.10.0.99 (10.10.0.99) 56(84) bytes of data.
From 10.30.0.10 icmp_seq=1 Destination Host Unreachable
From 10.30.0.10 icmp_seq=2 Destination Host Unreachable

--- 10.10.0.99 ping statistics ---
2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1003ms`,q:{en:`What does the From address tell you?`,hi:`From address aapko kya batata hai?`},o:[{en:`The gateway 10.30.0.1 is down`,hi:`Gateway 10.30.0.1 down hai`},{en:`The server itself (10.30.0.10) reported that it could not reach that host`,hi:`Server khud (10.30.0.10) ne report kiya ki woh us host tak nahi pahunch paya`},{en:`DNS is broken`,hi:`DNS kharab hai`},{en:`The remote host answered with a reset`,hi:`Remote host ne reset se jawab diya`}],a:1,w:{en:`The From field names the device that gave up. Here it is the sender itself, not the gateway, so the gateway is not the reporter. Always read who is complaining before blaming a device.`,hi:`From field us device ka naam deta hai jisne haar maani. Yahan woh sender khud hai, gateway nahi, isliye gateway reporter nahi hai. Kisi device ko blame karne se pehle padho kaun shikayat kar raha hai.`}}];export{e as default};