CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_saveSpecification`(IN `category_param` VARCHAR(100), IN `spectype_param` VARCHAR(100), IN `specvalue_param` VARCHAR(100), OUT `specId` INT)
begin
declare isFound boolean;
set specId=0;
set isFound=false;
if exists (select id from sepp_product_specification)
then
	select distinct(common_specvalue) into specvalue_param from sepp_product_spec_config where category=category_param and spectype=spectype_param and specvalue=specvalue_param;
	select id into specId from sepp_product_specification where category=category_param and spectype=spectype_param and specvalue=specvalue_param;
    if specId!=0
    then
    	set isFound = true;
    end if;
end if;

if !isFound
then
	INSERT INTO `sepp_product_specification`(`category`,`spectype`, `specvalue`) VALUES (category_param, spectype_param, specvalue_param);
    select LAST_INSERT_ID() into specId;
end if;

select specId;

end