import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient,HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-person-manage',
  templateUrl: './person-manage.component.html',
  styleUrls: ['./person-manage.component.css']
})
export class PersonManageComponent implements OnInit {
    
  //存放所有用户信息
  public UsersArray:any[]=[];
  public GroupList:any=[];      //组名
  public RoleList:any[]=[];      //角色名
  // public Users:any[]=[];
  
  //暂时存放要修改的用户信息，以及该用户组信息、角色信息
  public TempUserInfo:any[]=[];
  public TempUserId:number;
  public DelUserGroupId:number;     //用户删除组时 id
  public AllowDelGroup:number;      //是否允许删除组,1为不允许
  public DelUserRoleId:number;      //用户删除角色时 id
  public AllowDelRole:number;      //是否允许删除角色,1为不允许

  public DisGroup:any[]=[];     //添加时组名显示列表
  public AddGroupIndex:number;    //组名显示列表id
  public FlagAddGroup:number;     //0表示无可添加组
  public DisRole:any[]=[];      //添加时角色名显示列表
  public AddRoleIndex:number;     //角色名显示列表id
  public FlagAddRole:number;      //0表示无可添加角色

  //查询
  public Query_Name:string='';

  //有关页数
  public pages:number[]=[];   //从0开始，用来显示分多少页
  public TolPages:number=1; //总页数
  public Curpage:number=0;   //当前页数，0即第1页
  public JumpPage:number;   //跳转页数
  public EveryPages:number=5;   //每页显示的信息条数

  constructor(public router:Router,public http:HttpClient) { }

  ngOnInit() {

    this.getAllUsersInfo();
    this.getAllGroup();
    this.getAllRole();

    
  }

  //获取所有用户信息
  getAllUsersInfo(){

    var api='/api/initInfo';     
    this.http.get(api).subscribe((response:any)=>{
      console.log(response);

      this.UsersArray=response;     //所有用户信息
      for(var i=0;i<response.length;i++){
        if(this.UsersArray[i].Usergroup==null){
          this.UsersArray[i].Usergroup=[];
        }
        if(this.UsersArray[i].Userrole==null){
          this.UsersArray[i].Userrole=[];
        }
      }
      
      this.TolPages=this.UsersArray.length/this.EveryPages;
      // console.log(this.TolPages);
      for(let i=0;i<this.TolPages;i++){
        this.pages[i]=i;
      }

    })
    // console.log(this.UsersArray);
  }
  // 获取所有组名信息
  getAllGroup(){

    var api='/api/getAllGroup';     
    this.http.get(api).subscribe((response:any)=>{
      console.log(response);

      this.GroupList=response;       //所有组名
    })
    // console.log(this.GroupList);
  }
  // 获取所有角色名信息
  getAllRole(){

    var api='/api/getAllRole';     
    this.http.get(api).subscribe((response:any)=>{
      console.log(response);

      this.RoleList=response;       //所有角色名
    })
    // console.log(this.RoleList);
  }

  //查找用户详细信息
  searchUserInfo(){
    this.TempUserInfo=[];

    for(var i=0;i<this.UsersArray.length;i++){
      if(this.UsersArray[i].Username==this.Query_Name){
        if(this.UsersArray[i].Usergroup==null){
          this.UsersArray[i].Usergroup=[];
        }
        if(this.UsersArray[i].Userrole==null){
          this.UsersArray[i].Userrole=[];
        }
        this.TempUserId=i;
        this.TempUserInfo=this.UsersArray[this.TempUserId];
        break;
      }
      else {
        this.TempUserInfo=[{
          Username:'未找到！',
          Usergroup:[],
          Userrole:[],
          Date:''
        }];
        this.TempUserId=-1;
      }

    }
      
    this.judgeIfOne(this.TempUserId);

    // const httpOptions={headers:new HttpHeaders({'Content-Type':'application/json'})};
    // let api="/api/searchByuserN";
    // // var postdate = {name:this.Query_Name} 
    // this.http.post<string>(api,this.Query_Name,httpOptions).subscribe((response:any)=>{
    //   console.log(response);
    //   this.TempUserInfo=response;
    //   console.log(this.TempUserInfo);
    // })
    
  }

  //修改用户信息按钮
  editUserInfo(key){
    this.TempUserInfo=[];

    if(this.UsersArray[key].Usergroup==null){
      this.UsersArray[key].Usergroup=[];
    }
    if(this.UsersArray[key].Userrole==null){
      this.UsersArray[key].Userrole=[];
    }
    this.TempUserId=key;
    this.TempUserInfo=this.UsersArray[key];

    this.judgeIfOne(key);
  }
  // 判断是否剩下 一个组或角色，是的话不能删除
  judgeIfOne(key){

    if(this.UsersArray[key].Usergroup.length==1){
      this.AllowDelGroup=1;
    }
    else{
      this.AllowDelGroup=0;
    }

    if(this.UsersArray[key].Userrole.length==1){
      this.AllowDelRole=1;
    }
    else {
      this.AllowDelRole=0;
    }
  }


  //         用户组的操作
  // 即将删除组
  wantDelGroup(key){
    this.DelUserGroupId=key;
  }
  //删除组
  deleteGroup(){

    var tempDel=[this.UsersArray[this.TempUserId].Usergroup[this.DelUserGroupId]];

    this.UsersArray[this.TempUserId].Usergroup.splice(this.DelUserGroupId,1);
    this.TempUserInfo=this.UsersArray[this.TempUserId];

    const httpOptions={headers:new HttpHeaders({'Content-Type':'application/json'})};
    var api='/api/changeGroup';
    var postdate = {Del:tempDel,Ins:[],UserN:this.UsersArray[this.TempUserId].Username}
    this.http.post<string>(api,postdate,httpOptions).subscribe((response)=>{
      console.log(response);
      // this.ngOnInit();
    })
  }

  // 检查是否存在组，不存在status为0，显示在添加组列表中，反之不显示
  preAddGroup(){
    // var curUserGroup:any[]=this.TempUserInfo[0].Usergroup;
    var curUserGroup:any[]=this.UsersArray[this.TempUserId].Usergroup;
    var flag=0;
    var status=0;
    this.DisGroup=[];
    // this.DisGroup.splice(0,this.DisGroup.length);
    
    for(var i=0;i<this.GroupList.length;i++){
      for(var j=0;j<curUserGroup.length;j++){
        if(this.GroupList[i]==curUserGroup[j]){
          flag=1;break;
        }
      }
      if(flag==1){
        status=1;
      }
      this.DisGroup.push({
        Gname:this.GroupList[i],
        Status:status
      })

      flag=0;
      status=0;
    }

    this.travelDisGroup();
    // console.log(this.DisGroup);
  }

  // 即将添加组
  wantAddGroup(key){
    this.AddGroupIndex=key;
  }
  // 遍历要显示的组
  travelDisGroup(){
    var flag=0;
    for(var i=0;i<this.DisGroup.length;i++){
      if(this.DisGroup[i].Status==0){
        flag=1;break;
      }
    }
    if(flag==1){
      this.FlagAddGroup=1;
    }
    else {
      this.FlagAddGroup=0;
    }
  }

  // 添加组
  addGroup(){
    this.UsersArray[this.TempUserId].Usergroup.push(
      this.GroupList[this.AddGroupIndex]
    );
    this.TempUserInfo=this.UsersArray[this.TempUserId];
    this.DisGroup[this.AddGroupIndex].Status=1;
    this.travelDisGroup();

    var tempDel:any[];
    if(this.GroupList[this.AddGroupIndex]=='未分类'){
      tempDel=[];
      console.log('find');
    }
    else{
      console.log('not find')
      for(var i=0;i<this.UsersArray[this.TempUserId].Usergroup.length;i++){
        if(this.UsersArray[this.TempUserId].Usergroup[i]=='未分类'){
          tempDel=['未分类'];
          console.log('find');
          this.UsersArray[this.TempUserId].Usergroup.splice(i,1);
          this.TempUserInfo=this.UsersArray[this.TempUserId];
          break;
        }
      }
    }
    console.log(this.GroupList[this.AddGroupIndex]);
    var addGroup:any=[this.GroupList[this.AddGroupIndex]];

    const httpOptions={headers:new HttpHeaders({'Content-Type':'application/json'})};
    var api='/api/changeGroup';
    var postdate = {Del:tempDel,Ins:addGroup,UserN:this.UsersArray[this.TempUserId].Username}
    this.http.post<string>(api,postdate,httpOptions).subscribe((response)=>{
      console.log(response);
    })
  }


  //         用户角色的操作
  // 即将删除角色
  wantDelRole(key){
    this.DelUserRoleId=key;
  }
  // 删除角色
  deleteRole(){
    var tempDel=[this.UsersArray[this.TempUserId].Userrole[this.DelUserRoleId]];

    this.UsersArray[this.TempUserId].Userrole.splice(this.DelUserRoleId,1);
    this.TempUserInfo=this.UsersArray[this.TempUserId];

    const httpOptions={headers:new HttpHeaders({'Content-Type':'application/json'})};
    var api='/api/changeRole';
    var postdate = {Del:tempDel,Ins:[],UserN:this.UsersArray[this.TempUserId].Username}
    this.http.post<string>(api,postdate,httpOptions).subscribe((response)=>{
      console.log(response);
      // this.ngOnInit();
    })
  }

  // 检查是否存在角色，不存在status为0，显示在添加角色列表中，反之不显示
  preAddRole(){
    var curUserRole:any[]=this.UsersArray[this.TempUserId].Userrole;
    var flag=0;
    var status=0;
    this.DisRole=[];
    
    for(var i=0;i<this.RoleList.length;i++){
      for(var j=0;j<curUserRole.length;j++){
        if(this.RoleList[i]==curUserRole[j]){
          flag=1;break;
        }
      }
      if(flag==1){
        status=1;
      }
      this.DisRole.push({
        Rname:this.RoleList[i],
        Status:status
      })

      flag=0;
      status=0;
    }
    this.travelDisRole();
  }

  // 即将添加角色
  wantAddRole(key){
    this.AddRoleIndex=key;
  }
  // 遍历要显示的组
  travelDisRole(){
    var flag=0;
    for(var i=0;i<this.DisRole.length;i++){
      if(this.DisRole[i].Status==0){
        flag=1;break;
      }
    }
    if(flag==1){
      this.FlagAddRole=1;
    }
    else {
      this.FlagAddRole=0;
    }
  }

  // 添加角色
  addRole(){
    this.UsersArray[this.TempUserId].Userrole.push(
      this.RoleList[this.AddRoleIndex]
    );
    this.TempUserInfo=this.UsersArray[this.TempUserId];
    this.DisRole[this.AddRoleIndex].Status=1;
    this.travelDisRole();

    var addRole:any=[this.RoleList[this.AddRoleIndex]];

    const httpOptions={headers:new HttpHeaders({'Content-Type':'application/json'})};
    var api='/api/changeRole';
    var postdate = {Del:[],Ins:addRole,UserN:this.UsersArray[this.TempUserId].Username}
    this.http.post<string>(api,postdate,httpOptions).subscribe((response)=>{
      console.log(response);
    })
  }

  //分页功能相关函数
  //前一页
  preToPage(){
    if(this.Curpage>0){
      this.Curpage-=1;
    }
    console.log(this.Curpage);
  }

  //点击分页按钮跳转到某一页
  changePage(key){
    this.Curpage=this.pages[key];
    console.log(this.Curpage);
  }

  //后一页
  nextToPage(){
    if(this.Curpage<this.TolPages-1){
      this.Curpage+=1;
    }
    console.log(this.Curpage);
  }

  //输入跳转页数进行跳转
  jumpToPage(){
    if(this.JumpPage>0 && this.JumpPage-1<this.TolPages){
        this.Curpage=this.JumpPage-1;
    }
    else{
      alert('输入有误！');
    }
  }

  //回车跳转
  onJumpPageKey(e){
    if(e==13){
      this.jumpToPage();
    }
  }

}
